const express = require('express');
const Item = require('../../models/itemModel'); // Import the item model
const User = require('../../models/userModel'); // Import the user model
const checkUser = require('../../middleware/checkUser');
const router = express.Router();

// To create new item --> tested
router.post('/sell', checkUser, async (req, res) => {
    try {
        const { itemName, itemDescription, itemImageURL, itemPrice } = req.body;

        const newItem = new Item({
            itemName,
            itemDescription,
            itemImageURL,
            itemPrice,
            itemSeller: req.user.id, // Associate item with the logged-in user
        });

        const savedItem = await newItem.save();

        const seller = await User.findById(req.user.id);
        seller.itemsPosted.push(savedItem._id);
        await seller.save();

        return res.status(201).json(savedItem);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});

// Get all items --> tested
router.get('/all', checkUser, async (req, res) => {
    try {
        const items = await Item.find();
        res.status(200).json(items);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get a single item by ID --> tested
router.get('/one/:id', checkUser, async (req, res) => {
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

// Update an item by ID --> tested
router.put('/mod/:id', checkUser, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Only the seller of the item can update it
        if (item.itemSeller.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to update this item' });
        }

        const updatedData = req.body;
        const updatedItem = await Item.findByIdAndUpdate(req.params.id, updatedData, { new: true });

        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an item by ID --> tested
router.delete('/del/:id', checkUser, async (req, res) => {
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
        if (item.itemSeller.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to delete this item' });
        }

        await User.findByIdAndUpdate(req.user.id, {
            $pull: { itemsPosted: item._id }
        });

        await item.deleteOne();

        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Mark an item as sold --> tested
router.put('/sold/:id', checkUser, async (req, res) => {
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
        const buyerId = req.user.id;
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

// Get all unsold items --> tested
router.get('/unsold', checkUser, async (req, res) => {
    try {
        const unsoldItems = (await Item.find({ itemSold: false, itemSeller: { $ne: req.user.id } }).populate('itemSeller', '-password'));

        res.status(200).json(unsoldItems);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all items posted for sale by the logged-in user --> tested
router.get('/for/sale', checkUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.itemsPosted && user.itemsPosted.length > 0) {
            await user.populate('itemsPosted');
        }

        res.status(200).json(user.itemsPosted);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all items purchased by the logged-in user --> tested
router.get('/own', checkUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.itemsPurchased && user.itemsPurchased.length > 0) {
            await user.populate('itemsPurchased');
        }

        res.status(200).json(user.itemsPurchased);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


module.exports = router;