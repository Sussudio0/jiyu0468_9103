# jiyu0468_9103
# Animation Project Documentation

## How to Interact with the Work
1. **Loading the Page**: Open the `index.html` file in a web browser. The animation starts automatically upon page load.
2. **Observing Changes**: Watch visual transformations on screen. Events trigger every 5 seconds, with each event lasting 2 seconds.
3. **No Direct Interaction Required**: The animation is driven purely by time-based events without needing mouse or keyboard input.

## Individual Approach to Animating the Code
Implemented a time-driven animation system that:
- Creates dynamic visual experiences
- Schedules events at regular intervals
- Enables controlled visual transformations over time

## Inspiration for Animation
- **NoiseBlobs**: Pulsing patterns mimicking celestial bodies' expansion/contraction  
- **Radiants**: Glowing elements inspired by light installations  
- **Sparks**: Burst events replicating fireworks explosions  
- **Holes**: Twinkling effects influenced by bioluminescent organisms like fireflies  

## Technical Implementation
Combines p5.js with custom logic:
```javascript
// Core techniques
millis() // Time tracking
map() // Value interpolation