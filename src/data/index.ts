import type {
    Experience,
    NavItem,
    PersonalInfo,
    Project,
    SocialLink,
    Stat,
} from "@/types";

export const personalInfo: PersonalInfo = {
    name: "Faaiz Muzzammil",
    role: "Developer & marketer",
    /* Opens on a hard consonant, not on "I". It is set as a standfirst with a
       dropped capital, and a dropped "I" is a rule with a serif on it.

       Kept to two sentences. A cover standfirst is the one paragraph a reader
       has not yet decided to read, and everything it says twice it loses. */
    tagline:
        "Full-stack apps and AI agents out of Islamabad — then the growth work that gets them used. Final year, taking on work now.",
    email: "faaizmuzzammil@gmail.com",
    location: "Islamabad",
    available: true,
};

/* Grounded in the CV rather than rounded up. Each label names the thing
   measured so the number reads on its own.
   TODO(faaiz): adjust these if the numbers have moved. */
export const stats: Stat[] = [
    { value: 6, label: "Projects shipped" },
    { value: 15, suffix: "+", label: "Companies filed" },
    { value: 45, suffix: "%", label: "Signup lift" },
];

export const socialLinks: SocialLink[] = [
    // TODO(faaiz): replace with your real profile URLs.
    { name: "GitHub", url: "https://github.com/faaizmuzzammil", icon: "github" },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/faaizmuzzammil", icon: "linkedin" },
    { name: "Email", url: "mailto:faaizmuzzammil@gmail.com", icon: "mail" },
];

export const navItems: NavItem[] = [
    { name: "Home", href: "#home", icon: "home" },
    { name: "Work", href: "#work", icon: "folder" },
    { name: "Experience", href: "#experience", icon: "briefcase" },
];

/* Contact is deliberately not in this list. It has its own control at the
   end of the bar, and a department that is both an item and a button is
   the same destination twice on one 320px row. Toolkit sat here until the
   department went; nothing replaced it, because the bar is a list of what
   the page contains rather than a shape that has to be filled. */

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */
/* TODO(faaiz): add `repoUrl` and `link` per project — the buttons stay
   hidden until you do, so nothing renders as a dead link. Screenshots
   dropped at /public/projects/<slug>.jpg will replace the monogram tiles
   once you set `image`. */

export const projects: Project[] = [
    {
        id: 1,
        title: "AI Assignment Solver",
        slug: "ai-assignment-solver",
        category: "AI Tool",
        description: "Turns an assignment brief into a structured, cited draft.",
        longDescription:
            "A study tool that takes an assignment prompt, breaks it into the sub-questions it's really asking, and drafts a structured response with its reasoning shown rather than hidden.\n\nThe hard part was refusing to be a plagiarism machine. Prompt chaining plus an outline-first pass gets answers that are specific to the brief, and every claim is traceable to the section of the prompt it came from.",
        role: "Solo developer",
        context: "Personal project",
        year: "2025",
        status: "shipped",
        techStack: ["Python", "LangGraph", "React", "REST APIs"],
        features: [
            "Splits a brief into its underlying sub-questions",
            "Outline-first drafting to keep answers on-topic",
            "Shows its reasoning instead of a black-box answer",
            "Export to plain text or Markdown",
        ],
        featured: true,
    },
    {
        id: 2,
        title: "Trail Recommender",
        slug: "trail-recommender",
        category: "Recommendation System",
        description: "Suggests hiking trails from the ones you've already walked.",
        longDescription:
            "A recommendation system for hikers. It reads your history of visited trails and surfaces new ones that match the difficulty, length and terrain you keep coming back to.\n\nThe interesting constraint was the cold start: a new user has no history at all. Falling back to popularity within a region, then blending in similarity as soon as there are two or three walks on record, made the first session useful instead of empty.",
        role: "Solo developer",
        context: "Personal project",
        year: "2025",
        status: "shipped",
        techStack: ["Python", "Flask", "MongoDB", "React"],
        features: [
            "Content-based matching on difficulty, length and terrain",
            "Popularity fallback so a first-time user still sees results",
            "Region filtering",
            "Saves walked trails to sharpen later suggestions",
        ],
        featured: true,
    },
    {
        id: 3,
        title: "Chat App",
        slug: "chat-app",
        category: "Web App",
        description: "Real-time messaging with presence and history that survives a refresh.",
        longDescription:
            "A full-stack chat application with accounts, one-to-one rooms, typing indicators and online presence.\n\nMost of the work was in the states nobody demos: reconnecting after a dropped socket without duplicating messages, and keeping the local message list and the server in agreement when both are writing at once.",
        role: "Solo developer",
        context: "University project",
        year: "2024",
        status: "shipped",
        techStack: ["React", "Node.js", "Firebase", "JavaScript"],
        features: [
            "Email authentication with persistent sessions",
            "Live typing indicators and presence",
            "Message history that survives reconnects",
            "Responsive down to small phones",
        ],
        featured: false,
    },
    {
        id: 4,
        title: "AI Snake",
        slug: "ai-snake",
        category: "Game",
        description: "Classic Snake, plus an agent that plays it and shows its path.",
        longDescription:
            "Snake with two modes: you play, or you watch an agent play. The agent does pathfinding to the food while avoiding the trap of sealing itself into its own tail.\n\nGreedy shortest-path solves the first thirty seconds and then loses every time. Adding a survivability check — can it still reach its tail after eating? — is what turned a demo into something that finishes a board.",
        role: "Solo developer",
        context: "Personal project",
        year: "2024",
        status: "shipped",
        techStack: ["Python", "Pathfinding", "Pygame"],
        features: [
            "Playable and autonomous modes",
            "Live overlay of the path being considered",
            "Tail-reachability check to avoid self-trapping",
            "Adjustable speed and board size",
        ],
        featured: false,
    },
    {
        id: 5,
        title: "Brick Breaker",
        slug: "brick-breaker",
        category: "Game",
        description: "Arkanoid rebuilt with swept collision and hand-tuned levels.",
        longDescription:
            "A take on the arcade classic, built to practise game loops and collision handling with an interface that doesn't look like a 1998 tutorial.\n\nCollision was the whole exercise. Naive bounding-box checks let the ball tunnel through bricks at speed, so resolution moved to swept collision against the ball's travel path between frames.",
        role: "Solo developer",
        context: "University project",
        year: "2024",
        status: "shipped",
        techStack: ["C++", "Game Loop", "Collision Detection"],
        features: [
            "Swept collision so a fast ball can't tunnel through bricks",
            "Power-ups: multi-ball, paddle resize, slow motion",
            "Hand-designed level progression",
            "Score and lives persistence",
        ],
        featured: false,
    },
    {
        id: 6,
        title: "Music Player",
        slug: "music-player",
        category: "Desktop App",
        description: "Local library player with playlists, search and a real queue.",
        longDescription:
            "A desktop music player for a local library: it indexes a folder, reads the tags, and gives you playlists, search and a play queue.\n\nThe fiddly part was metadata. Real music folders are full of missing tags, wrong encodings and inconsistent artist names, so the indexer normalises what it can and falls back to the filename rather than showing a blank row.",
        role: "Solo developer",
        context: "University project",
        year: "2023",
        status: "archived",
        techStack: ["Java", "OOP", "MySQL"],
        features: [
            "Indexes a local folder and reads audio tags",
            "Playlists, search and a reorderable queue",
            "Graceful fallbacks for missing or malformed metadata",
            "Keyboard shortcuts for playback",
        ],
        featured: false,
    },
];

/* ------------------------------------------------------------------ */
/* Experience                                                          */
/* ------------------------------------------------------------------ */

export const experience: Experience[] = [
    {
        id: 1,
        role: "Digital Marketer",
        company: "MarketVerse AI",
        period: "Jan 2025 — Present",
        location: "Austin, USA · Remote",
        bullets: [
            "Run growth for an AI fintech platform. Signups up 45%, engagement up 30%.",
            "Own the content calendar and the retention campaigns end to end.",
        ],
    },
    {
        id: 2,
        role: "Software Developer Intern",
        company: "Datics AI",
        companyUrl: "https://datics.ai",
        period: "Jul 2025 — Aug 2025",
        location: "Islamabad, Pakistan",
        bullets: [
            "Built custom AI agents for a range of business use cases.",
            "Shipped a competitor-tracking tool the sales team still runs on.",
        ],
    },
    {
        id: 3,
        role: "Legal Consultant",
        company: "Independent",
        period: "Ongoing",
        location: "Islamabad, Pakistan",
        bullets: [
            "Registered 15+ companies, firms and NGOs with SECP, FBR and EAD.",
            "Handle the filings founders would otherwise stall on for months.",
        ],
    },
];

/* ------------------------------------------------------------------ */
/* THE TOOLKIT DEPARTMENT IS GONE                                      */
/* ------------------------------------------------------------------ */
/* A `tools` array of twenty-four entries and a `TOOL_CATEGORIES` list
   sat here, feeding a department of four ruled columns of logos.

   The issue is four departments now: the cover, the work, the roles,
   and the way to write. What the toolkit said is said better by the
   things either side of it — every project entry already lists the
   stack it was built with, and a list of logos claims a fluency that
   six shipped projects demonstrate. `ToolIcon` and the `Tool` type went
   with it rather than being left for a call site that no longer
   exists. */
