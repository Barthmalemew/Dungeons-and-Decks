let audioContext

// Global mute control
let isMuted = false

// Note frequency mapping for musical notes
const noteToFreq = {
	C4: 261.63,
	'G#3': 207.65,
	D4: 293.66,
	F4: 349.23,
	A4: 440.0,
	C5: 523.25,
	E5: 659.25,
}

// Scale definitions for musical sequences
const majorScale = [523.25, 587.33, 659.25, 698.46, 783.99, 880.0, 987.77, 1046.5] // C5, D5, E5, F5, G5, A5, B5, C6
const minorScale = [440.0, 523.25, 587.33, 659.25, 698.46, 783.99, 880.0, 987.77] // A4, C5, D5, E5, F5, G5, A5, B5
const pentatonicScale = [523.25, 659.25, 783.99, 880.0, 1046.5] // C5, E5, G5, A5, C6


// Initialize audio context
export async function init() {
	if (!audioContext) {
		try {
			audioContext = new window.AudioContext()
		} catch (error) {
			console.error('Failed to create audio context:', error)
		}
	}
	return Promise.resolve()
}

// Simple function to play a beep sound
export function simpleBeep(frequency = 440, duration = 0.2, volume = 0.3, type = 'sine') {
	if (!audioContext) init()
	if (isMuted) return
	const oscillator = audioContext.createOscillator()
	oscillator.type = type
	oscillator.frequency.value = frequency

	const gainNode = audioContext.createGain()
	gainNode.gain.value = volume

	// Create envelope
	gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
	gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration)

	oscillator.connect(gainNode)
	gainNode.connect(audioContext.destination)

	oscillator.start()
	oscillator.stop(audioContext.currentTime + duration)
}