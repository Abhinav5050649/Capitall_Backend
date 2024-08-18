const express = require('express');
const Item = require('../../models/itemModel'); // Import the item model
const User = require('../../models/userModel'); // Import the user model
const checkUser = require('../../middleware/checkUser');
const router = express.Router();

// Middleware for user authentication
//router.use(checkUser);

// To create new item
router.post('/items', checkUser, async (req, res) => {
    try {
        const { itemName, itemDescription, itemImageURL, itemPrice } = req.body;

        const newItem = new Item({
            itemName,
            itemDescription,
            itemImageURL,
            itemPrice,
            itemSeller: req.user._id, // Associate item with the logged-in user
        });

        const savedItem = await newItem.save();

        // Add the item to the user's posted items
        req.user.itemsPosted.push(savedItem._id);
        await req.user.save();

        res.status(201).json(savedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all items
router.get('/all', checkUser, async (req, res) => {
    try {
        const items = await Item.find().populate('itemSeller', '-password').populate('itemBuyer', '-password');
        res.status(200).json(items);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get a single item by ID
router.get('/:id', checkUser, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('itemSeller', '-password').populate('itemBuyer', '-password');
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update an item by ID
router.put('/:id', checkUser, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Only the seller of the item can update it
        if (item.itemSeller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to update this item' });
        }

        const updatedData = req.body;
        const updatedItem = await Item.findByIdAndUpdate(req.params.id, updatedData, { new: true });

        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an item by ID
router.delete('/:id', checkUser, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        // Check if the item is sold
        if (item.itemSold) {
            return res.status(403).json({ message: 'Cannot delete an item that has been sold' });
        }

        // Only the seller of the item can delete it
        if (item.itemSeller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to delete this item' });
        }

        await User.findByIdAndUpdate(req.user._id, {
            $pull: { itemsPosted: item._id }
        });

        await item.remove();

        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Mark an item as sold
router.put('/sell/:id', checkUser, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if the item is already sold
        if (item.itemSold) {
            return res.status(400).json({ message: 'Item has already been sold' });
        }

        // Ensure the seller is not the buyer
        const buyerId = req.user._id;
        if (item.itemSeller.toString() === buyerId.toString()) {
            return res.status(403).json({ message: 'Seller cannot purchase their own item' });
        }

        // Update the item status to sold and set the buyer's ID
        item.itemSold = true;
        item.itemBuyer = buyerId;
        await item.save();

        // Update the buyer's itemsPurchased array
        const buyer = await User.findById(buyerId);
        buyer.itemsPurchased.push(item._id);
        await buyer.save();

        res.status(200).json({ message: 'Item marked as sold successfully', item });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all unsold items
router.get('/unsold', checkUser, async (req, res) => {
    try {
        const unsoldItems = await Item.find({ itemSold: false }).populate('itemSeller', '-password');

        res.status(200).json(unsoldItems);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// // Get all items posted for sale by the logged-in user
// router.get('/for/sale', async (req, res) => {
//     try {
//         const userItems = await Item.find({ itemSeller: req.user._id }).populate('itemSeller', '-password');

//         res.status(200).json(userItems);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });

// Get all items posted for sale by the logged-in user
router.get('/for/sale', checkUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('itemsPosted');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.itemsPosted);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// // Get all items purchased by the logged-in user
// router.get('/purchases', async (req, res) => {
//     try {

//         const purchasedItems = await Item.find({ itemBuyer: req.user._id }).populate('itemSeller', '-password').populate('itemBuyer', '-password');

//         res.status(200).json(purchasedItems);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });

// Get all items purchased by the logged-in user
router.get('/purchases', checkUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('itemsPurchased');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.itemsPurchased);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;