type Props = { content: string };

export function BlogPostContent({ content }: Props) {
    return (
        <div
            className="prose prose-invert max-w-none
            [&_h2]:heading-md [&_h2]:mt-10 [&_h2]:mb-4
            [&_h3]:heading-sm [&_h3]:mt-8 [&_h3]:mb-3
            [&_p]:body-lg [&_p]:mb-4
            [&_ul]:space-y-2 [&_ul]:mb-6 [&_ul]:ml-4
            [&_li]:text-[var(--color-text-secondary)]
            [&_strong]:text-[var(--color-text)]"
        >
            {content.split("\n").map((line, i) => {
                if (line.startsWith("## ")) {
                    return (
                        <h2 key={i} className="heading-md mt-10 mb-4">
                            {line.replace("## ", "")}
                        </h2>
                    );
                }
                if (line.startsWith("### ")) {
                    return (
                        <h3 key={i} className="heading-sm mt-8 mb-3">
                            {line.replace("### ", "")}
                        </h3>
                    );
                }
                if (line.startsWith("- ")) {
                    return (
                        <li
                            key={i}
                            className="text-[var(--color-text-secondary)] ml-4"
                        >
                            {line.replace("- ", "")}
                        </li>
                    );
                }
                if (line.trim() === "") return null;
                return (
                    <p key={i} className="body-lg mb-4">
                        {line}
                    </p>
                );
            })}
        </div>
    );
}
