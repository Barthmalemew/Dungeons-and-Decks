import gsap from 'gsap'
import Draggable from 'gsap/Draggable'
import Flip from 'gsap/Flip'

gsap.registerPlugin(Draggable, Flip)

gsap.registerEffect({name: 'dealCards',
    effect: (targets, config) => {
        const x = window.innerWidth
        gsap.killTweensOf(targets)
        gsap.set(targets, {
            rotation: -25,
            x: -x,
            y: 100,
            scale: 0.5,
            opacity: 1,
        })
        return gsap.to(targets, {
            duration: config.duration,
            delay: config.delay,
            scale: 1,
            x:0,
            y:(index) => {
                const offset = index - 2
                return offset * offset * 5
            },
            rotation:(index) => {
                const offset = index -2
                return offset * 2
            },
            stagger: -0.1,
            ease: 'back.out(0.3)',
        })
    },
    defaults: {
        delay: 0.1,
        duration: 0.4,
    },
})
//this creates the animation of the cards flowing to the discard pile
gsap.registerEffect({
    name: 'discardHand',
    effect: (targets, config) => {
        gsap.killTweensOf(targets)
        const x = window.innerWidth
        return gsap.to(targets, {
            duration: 0.4,
            x,
            rotation: 25,
            stagger: -0.05,
            scale:0.5,
            ease: 'power2.out',
            onComplete: config.onComplete,
        })
    },
})

gsap.registerEffect({
    name: 'playCard',
    effect: (targets,config) => {
        const tl = gsap.timeline()
        return tl
        .to(targets, {
            duration: 1.5,
            y: '-=80',
            rotation: 50,
            scale: 0.8,
            ease: 'power3.out',
        })
        .to(targets, {
            delay: -1.3,
            duration: 0.8,
            scale: 0.5,
            rotation: 80,
            x: window.innerWidth * 1.2,
            y: window.innerHeight,
            ease: 'power3.inOut',
            onComplete: config.onComplete,
        })
    },
})


gsap.registerEffect({
    name: 'addCardToDeck',
    effect: (targets, config) => {
        const tl = gsap.timeline()
        return tl.to(targets, {
            duration: 1,
            x: '+=80',
            y: '-=80',
            rotation: 50,
            scale: 0.4,
            ease: 'power3.out',
            onComplete: config.onComplete,
        })
    },
})

export default gsap

window.gsap = gsap