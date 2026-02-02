// Ensure environment variables are loaded for standalone scripts
import '../src/config/env';
import { connectDatabase, disconnectDatabase } from '../src/config/database';
import User from '../src/models/User';
import Expense from '../src/models/Expense';

const seedData = async (): Promise<void> => {
  try {
    console.log('Connecting to database...');
    await connectDatabase();

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Expense.deleteMany({});

    console.log('Creating sample users...');
    const users = await User.insertMany([
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        monthlyBudget: 3000,
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        monthlyBudget: 2500,
      },
      {
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        monthlyBudget: 4000,
      },
      {
        name: 'Alice Williams',
        email: 'alice.williams@example.com',
        monthlyBudget: 3500,
      },
      {
        name: 'Charlie Brown',
        email: 'charlie.brown@example.com',
        monthlyBudget: 2800,
      },
      {
        name: 'Diana Prince',
        email: 'diana.prince@example.com',
        monthlyBudget: 5000,
      },
    ]);

    console.log('Creating sample expenses...');
    const expenses = [
      // John's expenses (4)
      {
        userId: users[0]._id,
        title: 'Lunch at restaurant',
        amount: 25.50,
        category: 'Food',
        date: new Date('2024-01-15'),
      },
      {
        userId: users[0]._id,
        title: 'Bus ticket',
        amount: 5.00,
        category: 'Travel',
        date: new Date('2024-01-16'),
      },
      {
        userId: users[0]._id,
        title: 'New shoes',
        amount: 120.00,
        category: 'Shopping',
        date: new Date('2024-01-20'),
      },
      {
        userId: users[0]._id,
        title: 'Coffee and pastry',
        amount: 8.75,
        category: 'Food',
        date: new Date('2024-01-25'),
      },
      // Jane's expenses (4)
      {
        userId: users[1]._id,
        title: 'Movie tickets',
        amount: 30.00,
        category: 'Entertainment',
        date: new Date('2024-01-10'),
      },
      {
        userId: users[1]._id,
        title: 'Electricity bill',
        amount: 85.00,
        category: 'Utilities',
        date: new Date('2024-01-12'),
      },
      {
        userId: users[1]._id,
        title: 'Doctor visit',
        amount: 150.00,
        category: 'Healthcare',
        date: new Date('2024-01-18'),
      },
      {
        userId: users[1]._id,
        title: 'Clothing shopping',
        amount: 95.50,
        category: 'Shopping',
        date: new Date('2024-01-23'),
      },
      // Bob's expenses (4)
      {
        userId: users[2]._id,
        title: 'Online course',
        amount: 199.99,
        category: 'Education',
        date: new Date('2024-01-08'),
      },
      {
        userId: users[2]._id,
        title: 'Groceries',
        amount: 75.50,
        category: 'Food',
        date: new Date('2024-01-14'),
      },
      {
        userId: users[2]._id,
        title: 'Flight tickets',
        amount: 450.00,
        category: 'Travel',
        date: new Date('2024-01-22'),
      },
      {
        userId: users[2]._id,
        title: 'Concert tickets',
        amount: 120.00,
        category: 'Entertainment',
        date: new Date('2024-01-25'),
      },
      // Alice's expenses (4)
      {
        userId: users[3]._id,
        title: 'Gym membership',
        amount: 45.00,
        category: 'Healthcare',
        date: new Date('2024-01-05'),
      },
      {
        userId: users[3]._id,
        title: 'Pizza dinner',
        amount: 18.99,
        category: 'Food',
        date: new Date('2024-01-13'),
      },
      {
        userId: users[3]._id,
        title: 'Book purchase',
        amount: 24.99,
        category: 'Education',
        date: new Date('2024-01-19'),
      },
      {
        userId: users[3]._id,
        title: 'Gas for car',
        amount: 65.00,
        category: 'Travel',
        date: new Date('2024-01-28'),
      },
      // Charlie's expenses (4)
      {
        userId: users[4]._id,
        title: 'Dinner with friends',
        amount: 42.50,
        category: 'Food',
        date: new Date('2024-01-09'),
      },
      {
        userId: users[4]._id,
        title: 'Internet bill',
        amount: 55.00,
        category: 'Utilities',
        date: new Date('2024-01-11'),
      },
      {
        userId: users[4]._id,
        title: 'Theater tickets',
        amount: 60.00,
        category: 'Entertainment',
        date: new Date('2024-01-17'),
      },
      {
        userId: users[4]._id,
        title: 'Haircut',
        amount: 35.00,
        category: 'Other',
        date: new Date('2024-01-24'),
      },
      // Diana's expenses (4)
      {
        userId: users[5]._id,
        title: 'Spa treatment',
        amount: 150.00,
        category: 'Healthcare',
        date: new Date('2024-01-07'),
      },
      {
        userId: users[5]._id,
        title: 'Fancy dinner',
        amount: 85.75,
        category: 'Food',
        date: new Date('2024-01-12'),
      },
      {
        userId: users[5]._id,
        title: 'Designer bag',
        amount: 280.00,
        category: 'Shopping',
        date: new Date('2024-01-21'),
      },
      {
        userId: users[5]._id,
        title: 'Vacation flight',
        amount: 550.00,
        category: 'Travel',
        date: new Date('2024-01-26'),
      },
    ];

    await Expense.insertMany(expenses);

    console.log('✅ Sample data seeded successfully!');
    console.log(`📊 Created ${users.length} users and ${expenses.length} unique expenses.`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await disconnectDatabase();
    console.log('Database connection closed.');
  }
};

// Run the seed function
seedData();