---
# try also 'default' to start simple
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: '#fff'
# apply any windi css classes to the current slide
class: 'text-center'
# https://sli.dev/custom/highlighters.html
highlighter: shiki
# show line numbers in code blocks
lineNumbers: false
# some information about the slides, markdown enabled
info: |
  ## Solve app
  Distributed problem-solving app.

  Learn more at [solve-app.co](https://solve-app.co)
# persist drawings in exports and build
drawings:
  persist: false
---

<center>
  <img src="public/logo.svg" alt="Solve" width="200" height="200" />
</center>
Distributed problem-solving app.

Video?
---

# What is the problem?

Everyone has problems: health, money, relationships or the meaning of life itself. Some of them are very hard. And they never stop repeating themselves. Problem is - we are often not very good at identifying and resolving them and it gets infinitely harder when we are ill, depressed or under a lot of stress. 

In order to understand the root cause of our issues and/or ask for help when needed, we should be able to state our problem and communicate it very clearly. For some cases, words alone can be enough to express ourselves. However, problems are not always simple enough to put clearly or to be solved without assistance.

Good news is that with the aid of technology and a community, we can do much better!

- Problems can be expressed visually as graphs: entities and relationships between them.
- Human brain is amazing at finding and matching patterns.
- Two hands are better than one: collaboration allows discovering different points of view to the same problem.

---

# Where does the idea come from?

 - Case studies:
   - Mental health
   - Finance consulting
   - Relationship management

---

# Showcase

 * Two screens
 * Two persons logging in, person A, person B
 * They have one problem each on their dashboards
 * Person A goes into his main problem
 * Person A creates some nodes
 * Person A creates some edges
 * Person A selects some part of his problem and shares it with a meaningful name
 * Person B sees that problem and joins it
 * Person B creates some nodes and edges
 * Person B saves the problem
 * Person A sees the proposal in his subgraph screen
 * Person A accepts the proposal
 * Person A attempts to merge the subproblem into his main view
 * Problem solved!
---
# Reward and gamification

Show the screenshot of the score bubble in the user interface.
Every user has a score point. With each problem being solved and accepted, the user earns more points. 

---
# Future plans

 * Machine Learning:
 With the help of artificial intelligence, it is possible to propose solutions from preexisting data, assess performance and accelerate the process of problem solving.

 * Template marketplace
Templates are amazing! 
People like to create things when opportunity exists. Community members can create materials, problem sets and toolkits to address repetitive problems. Later on, material created by users can be sold in a market place using crypto assets or unlock them with their score points.

---

# Animations

Animations are powered by [@vueuse/motion](https://motion.vueuse.org/).

```html
<div v-motion :initial="{ x: -80 }" :enter="{ x: 0 }">Slidev</div>
```

<div class="w-60 relative mt-6">
  <div class="relative w-40 h-40">
    <img
      v-motion
      :initial="{ x: 800, y: -100, scale: 1.5, rotate: -50 }"
      :enter="final"
      class="absolute top-0 left-0 right-0 bottom-0"
      src="https://sli.dev/logo-square.png"
    />
    <img
      v-motion
      :initial="{ y: 500, x: -100, scale: 2 }"
      :enter="final"
      class="absolute top-0 left-0 right-0 bottom-0"
      src="https://sli.dev/logo-circle.png"
    />
    <img
      v-motion
      :initial="{ x: 600, y: 400, scale: 2, rotate: 100 }"
      :enter="final"
      class="absolute top-0 left-0 right-0 bottom-0"
      src="https://sli.dev/logo-triangle.png"
    />
  </div>

  <div
    class="text-5xl absolute top-14 left-40 text-[#2B90B6] -z-1"
    v-motion
    :initial="{ x: -80, opacity: 0}"
    :enter="{ x: 0, opacity: 1, transition: { delay: 2000, duration: 1000 } }">
    Slidev
  </div>
</div>

<!-- vue script setup scripts can be directly used in markdown, and will only affects current page -->
<script setup lang="ts">
const final = {
  x: 0,
  y: 0,
  rotate: 0,
  scale: 1,
  transition: {
    type: 'spring',
    damping: 10,
    stiffness: 20,
    mass: 2
  }
}
</script>

<div
  v-motion
  :initial="{ x:35, y: 40, opacity: 0}"
  :enter="{ y: 0, opacity: 1, transition: { delay: 3500 } }">

[Learn More](https://sli.dev/guide/animations.html#motion)

</div>

---

# Diagrams

You can create diagrams / graphs from textual descriptions, directly in your Markdown.

<div class="grid grid-cols-2 gap-10 pt-4 -mb-6">

```mermaid {scale: 0.9}
sequenceDiagram
    Alice->John: Hello John, how are you?
    Note over Alice,John: A typical interaction
```

```mermaid {theme: 'neutral', scale: 0.8}
graph TD
B[Text] --> C{Decision}
C -->|One| D[Result 1]
C -->|Two| E[Result 2]
```

</div>

[Learn More](https://sli.dev/guide/syntax.html#diagrams)

---
layout: center
---

# Learn More

## [GitHub](https://github.com/w8r/solve)

---
