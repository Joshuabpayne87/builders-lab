# Component Studio - Premium UI Generation Framework

## Purpose
This framework helps create **professional-grade, visually stunning components** with advanced animations, 3D effects, and smooth interactions.

---

## Tech Stack Available

### Animation Libraries
- ✅ **Framer Motion** - Physics-based animations, gestures, layout animations
- ✅ **GSAP** - Professional timeline animations, scroll triggers
- ✅ **CSS Animations** - Hardware-accelerated transforms

### 3D Graphics
- ✅ **Three.js** - Full 3D rendering engine
- ✅ **@react-three/fiber** - React renderer for Three.js
- ✅ **@react-three/drei** - Useful helpers (OrbitControls, Stars, etc.)

### Styling
- ✅ **Tailwind CSS** - Utility-first styling
- ✅ **Custom CSS** - Advanced gradients, filters, blend modes
- ✅ **Glass Morphism** - Frosted glass effects with backdrop-blur

---

## Component Design Principles

### 1. **Visual Hierarchy**
- Use depth (shadows, blur, z-index)
- Scale important elements
- Guide user attention with motion

### 2. **Motion Design**
- **Easing**: Use natural curves (ease-out for entrances, ease-in for exits)
- **Duration**: 200-400ms for micro-interactions, 600-1000ms for transitions
- **Stagger**: Animate lists with 50-100ms delays
- **Spring Physics**: Use for organic, playful interactions

### 3. **Performance**
- Use `transform` and `opacity` (GPU accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` sparingly
- Lazy load heavy 3D scenes

### 4. **Accessibility**
- Respect `prefers-reduced-motion`
- Maintain keyboard navigation
- Ensure sufficient contrast
- Provide loading states

---

## Component Patterns

### Pattern 1: Glass Morphism Card
```tsx
<div className="
  bg-white/10 backdrop-blur-xl border border-white/20
  rounded-2xl p-6 shadow-2xl
  hover:bg-white/15 transition-all duration-300
  hover:shadow-purple-500/50 hover:border-white/40
">
  {/* Content */}
</div>
```

### Pattern 2: Animated Gradient Background
```tsx
<div className="relative overflow-hidden">
  <motion.div
    className="absolute inset-0 opacity-30"
    animate={{
      background: [
        'radial-gradient(circle at 0% 0%, #00f3ff 0%, transparent 50%)',
        'radial-gradient(circle at 100% 100%, #bd00ff 0%, transparent 50%)',
        'radial-gradient(circle at 0% 100%, #ff0055 0%, transparent 50%)',
      ]
    }}
    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
  />
</div>
```

### Pattern 3: Magnetic Hover Effect
```tsx
const [position, setPosition] = useState({ x: 0, y: 0 });

<motion.div
  onMouseMove={(e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: (e.clientX - rect.left - rect.width / 2) * 0.1,
      y: (e.clientY - rect.top - rect.height / 2) * 0.1,
    });
  }}
  onMouseLeave={() => setPosition({ x: 0, y: 0 })}
  animate={{ x: position.x, y: position.y }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
>
  {/* Content */}
</motion.div>
```

### Pattern 4: Particle System
```tsx
<Canvas>
  <Stars radius={100} depth={50} count={5000} factor={4} />
  <ambientLight intensity={0.5} />
  <pointLight position={[10, 10, 10]} />
</Canvas>
```

### Pattern 5: Morphing SVG
```tsx
<motion.svg viewBox="0 0 100 100">
  <motion.path
    d={isHovered ? "M 10,30..." : "M 10,10..."}
    transition={{ duration: 0.5 }}
    fill="url(#gradient)"
  />
</motion.svg>
```

---

## Premium Component Checklist

When creating a component, ensure it has:

### Visual Polish
- [ ] Smooth animations (no janky movements)
- [ ] Consistent color palette with gradients
- [ ] Glass morphism or depth effects
- [ ] Micro-interactions on hover/click
- [ ] Loading/skeleton states
- [ ] Empty states with helpful messaging

### Animation
- [ ] Entrance animations (fade in, slide in)
- [ ] Exit animations (fade out, scale down)
- [ ] Hover effects (scale, glow, lift)
- [ ] Click feedback (scale down, ripple)
- [ ] Staggered animations for lists
- [ ] Spring physics for natural feel

### 3D Effects (Optional)
- [ ] Parallax on scroll
- [ ] 3D card rotations
- [ ] Particle systems
- [ ] Dynamic lighting
- [ ] Depth of field blur

### Interactions
- [ ] Drag and drop with visual feedback
- [ ] Magnetic cursor attraction
- [ ] Gesture support (swipe, pinch)
- [ ] Keyboard shortcuts
- [ ] Touch-friendly tap targets

### Performance
- [ ] Lazy loading for heavy components
- [ ] Memoization for expensive renders
- [ ] Virtualization for long lists
- [ ] Optimized images (next/image)
- [ ] Reduced motion support

---

## Example: Premium Powerup Card

```tsx
import { motion, useMotionValue, useTransform } from "framer-motion";

export function PremiumPowerupCard({ powerup }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-50, 50], [10, -10]);
  const rotateY = useTransform(x, [-50, 50], [-10, 10]);

  return (
    <motion.div
      className="relative group perspective-1000"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.div
        className="
          relative p-6 rounded-2xl
          bg-gradient-to-br from-purple-900/50 to-pink-900/50
          backdrop-blur-xl border border-white/20
          shadow-2xl overflow-hidden
        "
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {/* Gradient overlay on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-purple-500/20 to-pink-500/0"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        {/* Icon with 3D transform */}
        <motion.div
          className="text-6xl mb-4"
          style={{ transform: "translateZ(50px)" }}
        >
          {powerup.icon}
        </motion.div>

        {/* Content */}
        <h3 className="text-xl font-bold text-white mb-2">{powerup.name}</h3>
        <p className="text-sm text-slate-300">{powerup.description}</p>

        {/* Shine effect */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: "-100%", skewX: -20 }}
          whileHover={{ x: "200%" }}
          transition={{ duration: 0.8 }}
        />

        {/* Particle glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500" />
      </motion.div>
    </motion.div>
  );
}
```

---

## Prompt Template for Component Generation

When requesting a new component, use this template:

```
Create a [COMPONENT_TYPE] component with:

**Visual Style:**
- Color scheme: [colors/gradients]
- Glass morphism: [yes/no]
- Shadow depth: [subtle/moderate/dramatic]

**Animations:**
- Entrance: [fade/slide/scale/none]
- Hover: [lift/glow/scale/rotate]
- Click: [ripple/scale-down/none]
- Exit: [fade/slide/scale/none]

**3D Effects:**
- Parallax: [yes/no]
- Rotation on hover: [yes/no]
- Particle system: [yes/no]

**Interactions:**
- Drag and drop: [yes/no]
- Magnetic hover: [yes/no]
- Gestures: [swipe/pinch/none]

**Content:**
- [Describe what data/content it displays]

**Special Features:**
- [Any unique requirements]
```

---

## References

- **Framer Motion**: https://www.framer.com/motion/
- **Three.js**: https://threejs.org/
- **GSAP**: https://greensock.com/gsap/
- **Dribbble**: https://dribbble.com/ (for design inspiration)
- **Awwwards**: https://www.awwwards.com/ (award-winning sites)

---

## Next Steps

1. Use this framework when building new components
2. Apply these patterns to existing components for upgrades
3. Test on multiple devices and browsers
4. Gather user feedback on animations
5. Iterate and refine based on performance metrics
