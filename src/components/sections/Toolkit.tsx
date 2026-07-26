import { TOOL_CATEGORIES, tools } from "@/data";
import RunningHead from "@/components/ui/RunningHead";
import ToolIcon from "@/components/ui/ToolIcon";
import Reveal from "@/components/motion/Reveal";

/**
 * The back-of-book listings.
 *
 * Four groups set as columns, each one headed and ruled, with its tools listed
 * beneath. This is how a magazine sets a directory: dense, aligned, one entry
 * per line, no cell borders anywhere. The old version put every tool in its own
 * ringed box, which is 23 containers holding one word each.
 *
 * The count sits against each group's head so the listing reports its own size
 * without a caption.
 */
export default function Toolkit() {
    return (
        <div>
            <RunningHead
                id="toolkit-title"
                number="03"
                name="Toolkit"
                meta={`${tools.length} tools · ${TOOL_CATEGORIES.length} groups`}
                title="What I reach"
                accentTitle="for."
            />

            <Reveal stagger={0.06} className="grid grid-cols-12 gap-x-8 gap-y-12">
                {TOOL_CATEGORIES.map((category) => {
                    const items = tools.filter((t) => t.category === category);
                    if (items.length === 0) return null;

                    return (
                        <section
                            key={category}
                            className="col-span-12 sm:col-span-6 lg:col-span-3"
                        >
                            <div className="flex items-baseline justify-between gap-3 border-t border-ink pt-3">
                                <h3 className="coord text-coord text-ink">{category}</h3>
                                <span className="coord tabular-nums text-coord text-ink-4">
                                    {String(items.length).padStart(2, "0")}
                                </span>
                            </div>

                            <ul className="mt-3">
                                {items.map((tool) => (
                                    <li
                                        key={tool.name}
                                        className="group/tool flex items-center gap-3 border-b border-line py-2.5"
                                    >
                                        <ToolIcon
                                            slug={tool.slug}
                                            label={tool.name}
                                            size={15}
                                            className="flex-none text-ink-4 transition-colors duration-300 group-hover/tool:text-ink"
                                        />
                                        <span className="truncate text-caption text-ink-2 transition-colors duration-300 group-hover/tool:text-ink">
                                            {tool.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    );
                })}
            </Reveal>
        </div>
    );
}
