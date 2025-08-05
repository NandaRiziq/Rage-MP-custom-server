# RAGE:MP Freeroam Server
&nbsp;

### 📄 Design Document
[https://www.tldraw.com/f/fagwZ3e-qruWVYaU-wYr6?d=v-4.184.2857.1478.BHJt3A_vhUSfl8NV7WTqf](https://www.tldraw.com/f/fagwZ3e-qruWVYaU-wYr6?d=v-1828.-390.6278.3090.BHJt3A_vhUSfl8NV7WTqf)

&nbsp;
### Core Gameplay
- **Freeroam Mode**: Complete freedom to explore Los Santos
- **Survival System**: Hunger and health management with persistent data
- **Interactive Food Stalls**: Purchase food items to restore hunger
- **First Aid Stations**: Buy medical supplies to restore health
- **Real-time HUD**: Live display of player stats (player name, money, hunger)
- **Persistent Player Data**: All progress saved automatically

&nbsp;

## 🎮 Commands

### Basic Commands
| Command | Description | Example |
|---------|-------------|---------|
| `/spawnride [model]` | Spawn vehicle and put player in it | `/spawnride infernus` |
| `/skin [name]` | Change player skin | `/skin mp_m_freemode_01` |
| `/weapon [name]` | Give weapon | `/weapon pistol` |
| `/fix` | Repair current vehicle | `/fix` |
| `/flip` | Flip overturned vehicle | `/flip` |
| `/kill` | Suicide command | `/kill` |
| `/hp` | Restore full health | `/hp` |
| `/armour` | Give full armor | `/armour` |


### Player Management Commands
| Command | Description | Example |
|---------|-------------|---------|
| `/changename [name]` | Change player name | `/changename John` |
| `/addmoney [amount]` | Add money to player | `/addmoney 5000` |
| `/sethunger [0-100]` | Set hunger level | `/sethunger 50` |
| `/sethealth [0-100]` | Set health level | `/sethealth 75` |

### Debug/Testing Commands
| Command | Description | Example |
|---------|-------------|---------|
| `/heal` | Heal 10 HP | `/heal` |
| `/takedamage` | Take 10 damage for testing | `/takedamage` |
| `/getpos` | Get current position coordinates | `/getpos` |
| `/tp [x] [y] [z]` | Teleport to coordinates | `/tp 0 0 71` |
| `/warp [id]` | Teleport to player | `/warp 5` |
| `/tpwaypoint` | Teleport to map waypoint | `/tpwaypoint` |
| `/tpfood [1-4]` | Teleport to food stall | `/tpfood 1` |
| `/tpmed [1-6]` | Teleport to medical station | `/tpmed 1` |

&nbsp;

## 🏪 Interactive Systems

### Food Stalls 🍴
Purchase food to restore hunger at these locations:
- **Beach Food Stall** - Vespucci Beach
- **Taco Bomb** - Downtown
- **Chihuahua Hotdogs** - Downtown  
- **Bishop's Chicken** - Davis

**Available Items:**
- Pizza: $30 (50 hunger)
- Burger: $15 (25 hunger)
- Donut: $5 (10 hunger)

&nbsp;

### First Aid Stations 🧑‍⚕️
Purchase medical supplies at these hospitals:
- **Eclipse Medical Tower**
- **Portola Trinity Medical Center**
- **Mount Zonah Medical Center**
- **Pillbox Hill Medical Center**
- **Central Los Santos Medical Center**
- **St Fiacre Hospital**

**Available Items:**
- First Aid Kit: $70 (100 health)
- Bandage: $15 (15 health)

&nbsp;

### Data Persistence
- Player data stored in JSON format
- Automatic saving of money, hunger, and health
- Social Club ID used as unique identifier

### Client-Server Architecture
- Event-driven communication between client and server
- Real-time HUD updates
- Secure transaction validation for purchases
