"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps {
    children: ReactNode;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
    className?: string;
    once?: boolean;
}

const directionMap = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 },
    none: {},
};

export function FadeIn({
    children,
    delay = 0,
    direction = "up",
    className,
    once = true,
}: FadeInProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, ...directionMap[direction] }}
            animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

interface StaggerContainerProps {
    children: ReactNode;
    className?: string;
    staggerDelay?: number;
}

export function StaggerContainer({
    children,
    className,
    staggerDelay = 0.1,
}: StaggerContainerProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
                visible: {
                    transition: { staggerChildren: staggerDelay },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
