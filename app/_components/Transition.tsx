import * as motion from "motion/react-client"

export default function TransitionOptions() {
    return (
        <motion.div
            style={ball}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                duration: 0.8,
                delay: 0.5,
                ease: [0, 0.71, 0.2, 1.01],
            }}
        />
    )
}

/**
 * ==============   Styles   ================
 */

const ball = {
    width: 200,
    height: 200,
    borderRadius: "50%",
    background: "var(--accent)",
}
