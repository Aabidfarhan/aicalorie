# Calorie Coach

Calorie Coach is an intelligent, user-friendly React application designed to help you track your daily calorie intake, monitor macronutrients, and stay on top of your health goals. Tailored specifically with Indian foods and snacks in mind, it provides seamless logging for breakfast, lunch, dinner, and snacks.

## Features

- **Personalized Goals**: Set your gender, height, weight, age, activity level, and goals to calculate your recommended Daily Calorie Target (TDEE).
- **Activity Syncing**: Automatically scales your daily walking distance (km) and steps based on the target calories you wish to burn, ensuring your activity metrics are always in sync.
- **Indian Food Database**: Comes pre-configured with popular Indian foods (e.g., Dosa, Biryani, Poha) and snacks (e.g., Maggi, Parle-G, Samosa) to make logging realistic and localized.
- **Dynamic Quantity Tracking**: Select a food and easily adjust its quantity (e.g., 2 Chapatis, 3 Oreos). Calories automatically scale.
- **Macro Overview**: See a breakdown of your daily protein, carbs, and fat intake.
- **Weekly Progress**: Visualizes your calorie goals and history across the week.
- **Strict Validation**: The app requires complete data for accuracy, ensuring you don't save empty profiles or 0-calorie manual meals.

## Tech Stack

- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: Local Storage (Persistent state)

## Getting Started

### Prerequisites

Make sure you have Node.js and npm installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/calorie-coach.git
   cd calorie-coach
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the App

Start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:5173` (or the port specified in your terminal).

## Usage

1. **Setup your Profile**: Head to the **Settings** page first to input your body metrics.
2. **Review Activity Targets**: Set your desired calories to burn, which will calculate equivalent walking steps and distance.
3. **Log Meals**: On the **Dashboard**, click the `+` icon on any meal card (Breakfast, Lunch, Dinner, Snacks) to search for foods or enter manual calories.
