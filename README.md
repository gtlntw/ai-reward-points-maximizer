# Credit Card Optimizer

Use AI to maximize your credit card rewards on every purchase! This web app analyzes your spending and recommends the best credit card from your wallet.

## Features

- **AI-Powered Analysis**: Uses Claude AI to recommend the best credit cards for each purchase
- **8 Premium Cards**: Complete data for popular cards (Citi, Amex, Capital One, Bilt)
- **Smart Filtering**: Toggle to exclude shopping portal rewards
- **Quick Categories**: One-click analysis for common spending categories
- **Rate Limited API**: Secure backend with 5 requests/minute per IP
- **Modern UI**: Beautiful interface built with React and Tailwind CSS
- **Zero Client-Side API Keys**: Secure serverless architecture

## Credit Cards Included

1. **Citi Double Cash** - 2% on everything
2. **Citi Custom Cash** - 5% on top category (up to $500/month)
3. **Citi Strata Premier** - 10x on Citi Travel, 3x on dining/groceries/gas
4. **Citi Strata** - 5x on Citi Travel, 3x on select categories
5. **Capital One Venture X** - 10x on Capital One Travel, 2x everywhere
6. **Amex Platinum** - 5x on flights and Amex hotels
7. **Amex Blue Cash Everyday** - 3% supermarkets, gas, online (capped)
8. **Bilt Mastercard** - 1x on rent, 3x dining, 5x Lyft

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **AI**: Anthropic Claude API (Sonnet 4.5)
- **Deployment**: Vercel

## Prerequisites

Before you begin, you'll need:

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **Anthropic API Key** - [Get it here](https://console.anthropic.com/settings/keys)
4. **GitHub Account** - [Sign up here](https://github.com/join)
5. **Vercel Account** - [Sign up here](https://vercel.com/signup)

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=your_actual_api_key_here
```

**How to get an Anthropic API Key:**
1. Go to https://console.anthropic.com/settings/keys
2. Sign up or log in
3. Click "Create Key"
4. Copy the key and paste it in your `.env` file

### 3. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

**Note**: The API endpoint won't work locally without additional setup. For full functionality, deploy to Vercel (see below).

### 4. Build for Production

```bash
npm run build
```

## Deployment to Vercel

### Step 1: Push to GitHub

1. **Create a new repository on GitHub**:
   - Go to https://github.com/new
   - Name it `credit-card-optimizer` (or your preferred name)
   - Keep it **public** or **private** (your choice)
   - **Do NOT** initialize with README, .gitignore, or license
   - Click "Create repository"

2. **Push your code** (the git repository is already initialized):

```bash
# Add all files
git add .

# Create a commit
git commit -m "Initial commit - Credit card optimizer"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/credit-card-optimizer.git

# Push to GitHub
git push -u origin claude/credit-card-optimizer-setup-017UYP7cPpXYZZmmx7DYmjHz:main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 2: Deploy to Vercel

1. **Go to Vercel** and sign in: https://vercel.com

2. **Import your project**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect it as a Vite project

3. **Configure the project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Environment Variable**:
   - Under "Environment Variables"
   - Add: `ANTHROPIC_API_KEY` = `your_api_key_here`
   - Make sure to select "Production", "Preview", and "Development"

5. **Deploy**:
   - Click "Deploy"
   - Wait 1-2 minutes for deployment to complete
   - Your app will be live at `https://your-app-name.vercel.app`

### Step 3: Test Your Deployment

1. Visit your Vercel URL
2. Try a quick category like "Dining" or "Grocery"
3. Verify you get AI recommendations

## API Rate Limiting

The `/api/analyze` endpoint includes rate limiting:
- **Limit**: 5 requests per minute per IP address
- **Response Headers**:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: When the limit resets

## Project Structure

```
credit-card-optimizer/
├── api/
│   └── analyze.js          # Serverless function for Claude API
├── src/
│   ├── App.jsx             # Main React component
│   ├── main.jsx            # React entry point
│   └── index.css           # Tailwind CSS imports
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
├── vercel.json             # Vercel deployment config
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## How It Works

1. **User Input**: User describes a purchase or selects a category
2. **API Call**: Frontend sends query to `/api/analyze` endpoint
3. **AI Analysis**: Serverless function calls Claude API with credit card data
4. **Response**: Claude analyzes and returns top 2 card recommendations
5. **Display**: Results shown with card name, rate, and explanation

## Security Features

- **No client-side API keys**: API key only exists in serverless environment
- **Rate limiting**: Prevents abuse (5 req/min per IP)
- **Input validation**: All inputs are validated before processing
- **Error handling**: Graceful error messages without exposing internals

## Customization

### Adding More Credit Cards

Edit `src/App.jsx` and add to the `CREDIT_CARDS` object:

```javascript
"Card Name": {
  color: "from-blue-500 to-purple-600",
  rewards: [
    { category: "Category", multiplier: "3x points", details: "Optional details" }
  ],
  specialRules: "Optional special notes"
}
```

### Changing AI Behavior

Edit `api/analyze.js` and modify the prompt sent to Claude:

```javascript
const message = await anthropic.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1800,
  messages: [{ role: "user", content: "Your custom prompt..." }]
});
```

### Adjusting Rate Limits

Edit `api/analyze.js`:

```javascript
const RATE_LIMIT = 10;  // Change from 5 to 10 requests
const RATE_WINDOW = 60 * 1000;  // Time window in milliseconds
```

## Troubleshooting

### "API key not configured" error
- Make sure you added `ANTHROPIC_API_KEY` in Vercel environment variables
- Redeploy after adding the environment variable

### "Rate limit exceeded" error
- Wait 60 seconds before trying again
- Or increase the rate limit in `api/analyze.js`

### API not responding locally
- The serverless function only works when deployed to Vercel
- Use `vercel dev` for local serverless function testing

### Build fails on Vercel
- Check that all dependencies are in `package.json`
- Verify your Node.js version (should be 18+)

## Cost Considerations

- **Vercel**: Free tier includes 100GB bandwidth, serverless functions
- **Anthropic API**: Pay-per-use (~$0.003 per request with Sonnet)
- **Estimated costs**: ~$0.30 for 100 analyses

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project however you'd like.

## Credits

- Built with [React](https://react.dev/) and [Vite](https://vitejs.dev/)
- Powered by [Anthropic Claude](https://www.anthropic.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Deployed on [Vercel](https://vercel.com/)

## Support

If you have questions or need help:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [Anthropic API docs](https://docs.anthropic.com/)
3. Check [Vercel documentation](https://vercel.com/docs)

---

**Enjoy maximizing your credit card rewards! 💳**
