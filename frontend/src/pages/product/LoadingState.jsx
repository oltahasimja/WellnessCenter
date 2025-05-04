import { motion } from 'framer-motion';

const LoadingState = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="relative w-24 h-24">
          {[...Array(3)].map((_, i) => (
            <motion.div 
              key={i}
              className="absolute w-6 h-6 bg-teal-400 rounded-full"
              style={{
                left: `${i * 32}px`,
                top: '50%',
                transform: 'translateY(-50%)'
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [1, 0.6, 1],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>
      <p className="text-teal-600 font-medium text-lg">Loading Your Wellness Collection</p>
    </div>
  </div>
);

export default LoadingState;