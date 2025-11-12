function generateTone(
    frequency: number,
    duration: number,
    sampleRate: number = 44100
): Float32Array {
    const samples = Math.floor(sampleRate * duration)
    const buffer = new Float32Array(samples)
    const angularFrequency = (2 * Math.PI * frequency) / sampleRate

    for (let i = 0; i < samples; i++) {
        buffer[i] = Math.sin(angularFrequency * i)
    }

    return buffer
}


export function generateToneWithAmplitude(
    frequency: number,
    duration: number,
    amplitude: number,
    sampleRate: number = 44100
): Float32Array {
    const buffer = generateTone(frequency, duration, sampleRate)
    const scale = 20 * Math.pow(10, amplitude / 20) 
    //add a lil ramp up and down to avoid clicks
    const rampUp = Math.min(1, (0.01 * sampleRate) / duration) // 10ms ramp up
    const rampDown = Math.min(1, (0.01 * sampleRate) / duration) // 10ms ramp down
    for (let i = 0; i < buffer.length; i++) {
        if (i < rampUp * sampleRate) {
            buffer[i] *= i / (rampUp * sampleRate) // Ramp up
            //ramp down still has clicks
        }
        if (i > buffer.length - rampDown * sampleRate) {
            buffer[i] *= (buffer.length - i) / (rampDown * sampleRate) 
        }
    }
    for (let i = 0; i < buffer.length; i++) {
        console.log(buffer[i])
        buffer[i] *= scale 
    }
    return buffer
}

export function playTone(
    frequency: number,
    duration: number,
    amplitude: number,
    sampleRate: number = 44100
): AudioBufferSourceNode {
    if (!window.AudioContext) {
        throw new Error("AudioContext is not supported in this browser.")
    }
    const audioContext = new window.AudioContext()
    const buffer = generateToneWithAmplitude(frequency, duration, amplitude, sampleRate)
    const audioBuffer = audioContext.createBuffer(1, buffer.length, sampleRate)
    audioBuffer.getChannelData(0).set(buffer)

    const source = audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioContext.destination)
    source.start()

    return source
}

export function playAlternatingTone(
    frequency: number,
    duration: number,
    amplitude: number,
    sampleRate: number = 44100,
    interval: number = 0.5,
    gap: number = 0.1
): void {
    playAlternatingToneTillTime(frequency, duration, amplitude, sampleRate, interval, gap)
    console.log(
        `Playing alternating tone at ${frequency} Hz for ${duration} seconds with amplitude ${amplitude} dB SPL at ${sampleRate} Hz sample rate.`
    )
}

function playAlternatingToneTillTime(
    frequency: number,
    duration: number,
    amplitude: number,
    sampleRate: number = 44100,
    interval: number = 0.5,
    gap: number = 0.1
): void {
    playTone(frequency, interval, amplitude, sampleRate)

    if (duration > 0) {
        setTimeout(
            () => {
                playAlternatingToneTillTime(
                    frequency,
                    duration - interval,
                    amplitude,
                    sampleRate,
                    interval
                )
            },
            (interval + gap) * 1000
        ) // Convert seconds to milliseconds
    } else {
        console.log("Finished playing alternating tones.")
    }
}
