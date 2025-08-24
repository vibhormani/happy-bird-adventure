# 🎮 Happy Sky Adventure - A Kid-Friendly Flying Game

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34C26?logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Canvas](https://img.shields.io/badge/Canvas-FF6384?logo=chartdotjs&logoColor=white)
![Age](https://img.shields.io/badge/Age-4--10%20years-green)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

**A colorful, engaging, and super-easy HTML5 flying game designed specifically for young children aged 4-10 years old.**

[**🎮 Play Now**](https://vibhormani.github.io/happy-bird-adventure/) | [**🐛 Report Bug**](https://github.com/vibhormani/happy-bird-adventure/issues) | [**✨ Request Feature**](https://github.com/vibhormani/happy-bird-adventure/issues)

</div>

---

## 🌟 Features

### 🎯 Kid-Friendly Gameplay
- **Super Easy Mode**: Designed for young children with forgiving physics
- **Hold-to-Fly**: Simple controls - just hold Space or touch the screen
- **Huge Pipe Gaps**: 300px openings make it easy to navigate
- **Centered Flying**: Character stays in the middle of the screen
- **Auto-Fly Mode**: Rainbow power-up provides 5 seconds of automatic flying

### 🚀 Character Selection
Choose from 8 adorable flying characters:
- 🐤 **Chick** - The classic yellow bird
- 🐦 **Blue Bird** - Swift and graceful
- 🦜 **Parrot** - Colorful tropical friend
- ✈️ **Airplane** - For aspiring pilots
- 🚀 **Rocket** - Blast through the sky
- 🚁 **Helicopter** - Steady and reliable
- 🎈 **Balloon** - Float gently upward
- 🦋 **Butterfly** - Delicate and beautiful

### 🌈 Power-Ups
- **🛡️ Shield**: Protects from one collision
- **⭐ Star**: Bonus 10 points
- **💖 Heart**: Gives an upward boost
- **🌈 Rainbow**: 5 seconds of auto-fly mode

### ✨ Visual Effects
- Beautiful gradient sky with animated sun
- Floating hearts, stars, and clouds
- Particle effects for all actions
- Sparkle trail behind characters
- Smooth animations throughout

### 🎵 Audio Features
- Gentle background music
- Sound effects for all actions
- Mute button for quiet play

## 🚀 Quick Start

### Play Online
Visit [https://vibhormani.github.io/happy-bird-adventure/](https://vibhormani.github.io/happy-bird-adventure/)

### Play Locally
1. Clone the repository:
```bash
git clone https://github.com/vibhormani/happy-bird-adventure.git
cd happy-bird-adventure
```

2. Open in browser:
```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js
npx http-server

# Or simply open index.html in your browser
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

3. Navigate to `http://localhost:8000` (if using a server)

## 🎮 How to Play

1. **Choose Your Character**: Select from 8 fun flying characters
2. **Start Flying**: Click "Start Flying!" button
3. **Controls**:
   - **Desktop**: Hold Space bar to fly up, release to fall
   - **Mobile/Tablet**: Touch and hold screen to fly up
4. **Avoid Pipes**: Navigate through the green pipes
5. **Collect Power-ups**: Grab special items for bonuses
6. **Score Points**: Each pipe passed = 1 point, Stars = 10 points

## 🛠️ Technical Details

### Technologies Used
- **HTML5 Canvas**: For rendering graphics
- **Vanilla JavaScript**: No frameworks, pure JS for performance
- **CSS3**: Animations and styling
- **Web Audio API**: Dynamic sound generation
- **Local Storage**: For saving best scores

### Game Physics
```javascript
// Super easy physics for kids
const gravity = 0.15;        // Very gentle falling
const liftForce = -0.35;     // Smooth upward movement
const maxVelocity = 6;       // Capped speed
const pipeGap = 300;         // Huge openings
const pipeSpeed = 2;         // Slow pipe movement
```

### Browser Compatibility
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📁 Project Structure

```
happy-bird-adventure/
├── index.html          # Main HTML file with game container
├── game.js            # Game logic and mechanics
├── README.md          # Documentation
├── LICENSE            # MIT License
├── CONTRIBUTING.md    # Contribution guidelines
├── CODE_OF_CONDUCT.md # Community guidelines
├── package.json       # NPM configuration
├── .gitignore        # Git ignore file
└── .github/          # GitHub specific files
    ├── ISSUE_TEMPLATE/
    │   ├── bug_report.md
    │   └── feature_request.md
    └── workflows/
        └── deploy.yml # GitHub Pages deployment
```

## 🚀 Deployment

### GitHub Pages
1. Fork this repository
2. Go to Settings → Pages
3. Select "Deploy from branch"
4. Choose "main" branch and "/root" folder
5. Save and wait for deployment

### Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/vibhormani/happy-bird-adventure)

### Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vibhormani/happy-bird-adventure)

## 🤝 Contributing

We love contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Ways to Contribute
- 🐛 Report bugs
- 💡 Suggest new features
- 🎨 Improve graphics or animations
- 🌍 Add translations
- 📝 Improve documentation
- ⭐ Star the repository

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Community

- **Code of Conduct**: Please read our [Code of Conduct](CODE_OF_CONDUCT.md)
- **Issues**: [GitHub Issues](https://github.com/vibhormani/happy-bird-adventure/issues)
- **Discussions**: [GitHub Discussions](https://github.com/vibhormani/happy-bird-adventure/discussions)

## 🙏 Acknowledgments

- Inspired by the classic Flappy Bird game
- Built with love for young gamers
- Special thanks to all contributors

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/vibhormani/happy-bird-adventure?style=social)
![GitHub forks](https://img.shields.io/github/forks/vibhormani/happy-bird-adventure?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/vibhormani/happy-bird-adventure?style=social)

---

<div align="center">
Made with ❤️ for kids everywhere

**[Play Now](https://vibhormani.github.io/happy-bird-adventure/) | [Star on GitHub](https://github.com/vibhormani/happy-bird-adventure)**
</div>