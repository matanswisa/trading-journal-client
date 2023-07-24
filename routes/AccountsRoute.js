import { Router } from "express";
import Account from "../models/accounts.js";
import User from "../models/user.js";
import Mongoose from "mongoose";

const router = Router();


router.delete('/deleteAccount', async (req, res) => {
  try {
    const { accountId, userId } = req.body; // Assuming the ID is passed in the request body

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    let accounts = user.accounts;
    if (!accounts.length) return res.status(400).json({ message: "No accounts to delete" });

    // Convert the accountId to a Mongoose ObjectId
    const accountToDeleteId = accountId;

    // Filter out the account to be deleted
    accounts = accounts.filter(account => !account._id == accountToDeleteId);
    await User.updateOne({ _id: userId }, { accounts });

    // Check if the account exists
    const account = await Account.findById(accountId);
    if (!account) {
      // If the account doesn't exist, return an error response
      return res.status(400).json({ message: 'Account not found' });
    }

    // Perform the deletion logic using the accountId
    await Account.findByIdAndDelete(accountId);

    // Update the IsSelected field for the remaining accounts
    await Account.updateMany({}, { $set: { IsSelected: false } });

    // Set the IsSelected field to true for the first account (if available)
    const firstAccount = await Account.findOne({});
    if (firstAccount) {
      await Account.updateOne({ _id: firstAccount._id }, { $set: { IsSelected: true } });
    }

    // Return a success response
    res.status(200).json({ message: `Account deleted - ${accountId}` });
  } catch (error) {
    console.error(error);
    // Return an error response
    res.status(500).json({ message: 'Failed to delete the account' });
  }
});


router.post('/updateIsSelectedAccount', (req, res) => {
  const { AccountName } = req.body;
  console.log(AccountName);

  // Update the isSelected field for the specified account in the database

  // Assuming you're using a database library like Mongoose
  Account.updateMany(
    {}, // Update all accounts
    { IsSelected: "false" } // Set isSelected to "false" (as a string) for all accounts
  )
    .then(() => {
      Account.updateOne(
        { AccountName }, // Find the specified account by accountName
        { IsSelected: "true" } // Set isSelected to "true" (as a string) for the specified account
      )
        .then(() => {
          res.status(200).json({ message: 'isSelected field updated successfully' });
        })
        .catch((err) => {
          res.status(500).json({ message: 'Failed to update isSelected field' });
        });
    })
    .catch((err) => {
      res.status(500).json({ message: 'Internal server error' });
    });
});


router.get("/accounts", async (req, res) => {
  try {
    const accounts = await Account.find(); // Assuming you're using a MongoDB database and the Account model

    res.status(200).json(accounts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error when retrieving accounts');
  }
});



router.post("/createAccount", async (req, res) => {
  try {
    const { userId, data } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new account with the provided data
    const newAccount = await Account.create(data);
    const accounts = user.accounts;
    // Add the new account to the user's accounts array
    accounts.push(newAccount);

    // Save the updated user object to the database
    // await user.save();
    await User.updateOne({ _id: userId }, { accounts })

    // Update other accounts' IsSelected field to "false"
    await Account.updateMany(
      { _id: { $ne: newAccount._id } }, // Excluding the newly created account
      { $set: { IsSelected: "false" } }
    );

    // Update the newly created account's IsSelected field to "true"
    await Account.updateOne(
      { _id: newAccount._id },
      { $set: { IsSelected: "true" } }
    );

    res.status(200).json({ AccountId: newAccount._id });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error when adding an Account');
  }
});


// Update an existing account by ID
router.put("/editAccount/:id", async (req, res) => {
  const accountId = req.params.id;
  const data = req.body;

  try {
    // Update the account with the provided data
    await Account.findByIdAndUpdate(accountId, data);

    // If you want to update other accounts' IsSelected field to "false" except the updated account
    await Account.updateMany(
      { _id: { $ne: accountId } },
      { $set: { IsSelected: "false" } }
    );

    // Update the updated account's IsSelected field to "true"
    await Account.findByIdAndUpdate(accountId, { $set: { IsSelected: "true" } });

    res.status(200).json({ message: "Account updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error when updating the account");
  }
});



export default router;