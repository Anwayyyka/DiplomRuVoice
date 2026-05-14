import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

export default function AnimatedBackground({ isDark = true }) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Основной сплошной фон (чёрный/белый) */}
      <div
        className={cn(
          "absolute inset-0",
          isDark ? "bg-black" : "bg-white"
        )}
      />

      {/* Gradient Orbs */}
      <motion.div
        className={cn(
          "absolute w-[600px] h-[600px] rounded-full blur-[120px]",
          isDark ? "bg-purple-900 opacity-70" : "bg-purple-300 opacity-50"
        )}
        animate={{
          x: [0, 100, 50, 0],
          y: [0, -50, 100, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ top: '-10%', left: '-10%' }}
      />
      
      <motion.div
        className={cn(
          "absolute w-[500px] h-[500px] rounded-full blur-[100px]",
          isDark ? "bg-blue-900 opacity-60" : "bg-blue-300 opacity-40"
        )}
        animate={{
          x: [0, -80, 40, 0],
          y: [0, 80, -40, 0],
          scale: [1, 0.8, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ top: '30%', right: '-5%' }}
      />
      
      <motion.div
        className={cn(
          "absolute w-[400px] h-[400px] rounded-full blur-[80px]",
          isDark ? "bg-pink-900 opacity-65" : "bg-pink-300 opacity-45"
        )}
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -60, 30, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ bottom: '10%', left: '20%' }}
      />

      {/* Flowing Lines – анимация формы (как в base44) */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <motion.path
          d="M0,100 Q200,50 400,100 T800,100 T1200,100 T1600,100"
          stroke={isDark ? "#8b5cf6" : "#a78bfa"}
          strokeWidth="2"
          fill="none"
          className={isDark ? "opacity-30" : "opacity-20"}
          animate={{
            d: [
              "M0,100 Q200,50 400,100 T800,100 T1200,100 T1600,100",
              "M0,120 Q200,150 400,80 T800,120 T1200,80 T1600,120",
              "M0,100 Q200,50 400,100 T800,100 T1200,100 T1600,100"
            ]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.path
          d="M0,200 Q200,150 400,200 T800,200 T1200,200 T1600,200"
          stroke={isDark ? "#ec4899" : "#f472b6"}
          strokeWidth="1.5"
          fill="none"
          className={isDark ? "opacity-30" : "opacity-20"}
          animate={{
            d: [
              "M0,200 Q200,150 400,200 T800,200 T1200,200 T1600,200",
              "M0,180 Q200,220 400,160 T800,180 T1200,220 T1600,180",
              "M0,200 Q200,150 400,200 T800,200 T1200,200 T1600,200"
            ]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </svg>

      {/* Grid Pattern */}
      <div 
        className={cn(
          "absolute inset-0",
          isDark ? "opacity-20 bg-white" : "opacity-10 bg-black"
        )}
        style={{
          backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px),
                           linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
}