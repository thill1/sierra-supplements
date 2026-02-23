"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface AccordionItem {
    question: string;
    answer: string;
}

export function Accordion({ items }: { items: readonly AccordionItem[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="space-y-3">
            {items.map((item, i) => (
                <div
                    key={i}
                    className="card !p-0 overflow-hidden"
                >
                    <button
                        onClick={() => setOpenIndex(openIndex === i ? null : i)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--color-bg-muted)] transition-colors"
                        aria-expanded={openIndex === i}
                    >
                        <span className="font-medium pr-4">{item.question}</span>
                        <motion.span
                            animate={{ rotate: openIndex === i ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex-shrink-0"
                        >
                            <ChevronDown className="w-5 h-5 text-[var(--color-text-muted)]" />
                        </motion.span>
                    </button>
                    <AnimatePresence>
                        {openIndex === i && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                <p className="px-5 pb-5 body-sm text-[var(--color-text-secondary)]">
                                    {item.answer}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}
