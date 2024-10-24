const Contacts = require("../models/contactModel");


// Route to get contacts with filtering and sorting
exports.getContacts = async (req, res, next) => {
  try {
    // Extract query parameters for filtering
    const { name, email, timezone, sort } = req.query;

    // Create a filter object
    let filter = {};

    if (name) {
      filter.name = new RegExp(name, "i"); // Case-insensitive search
    }
    if (email) {
      filter.email = new RegExp(email, "i");
    }
    if (timezone) {
      filter.timezone = timezone;
    }

    // Construct query with filtering
    let query = Contacts.find(filter);

    // Apply sorting if specified
    if (sort) {
      const sortBy = sort.split(",").join(" ");
      query = query.sort(sortBy);
    }

    // Execute the query
    const contacts = await query;

    res.status(200).json({
      status: "success",
      results: contacts.length,
      data: contacts,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve contacts.",
      error: err.message,
    });
  }
};
