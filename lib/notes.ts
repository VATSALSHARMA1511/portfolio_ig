export interface Note {
  slug: string
  title: string
  titleParts: {
    before: string
    italic: string
    after: string
  }
  date: string
  category: string
  body: string
}

const NOTES: Note[] = [
  {
    slug: 'bkt-engine',
    title: 'Why I wrote the BKT engine from scratch',
    titleParts: {
      before: 'Why I wrote the ',
      italic: 'BKT engine',
      after: ' from scratch',
    },
    date: 'Jun 2026',
    category: 'Essay',
    body: `Why I wrote the BKT engine from scratch

I was bad at DSA. Like, genuinely bad. Not "needs more practice" bad — "hasn't really thought about why this algorithm works" bad. I could follow a tutorial, implement the code, and forget everything in two days. LeetCode felt like grinding without direction. Striver's sheet felt like a checklist I was ticking without actually learning.

So I thought: what if the tool just... knew what I sucked at?

That's the one-line origin of Vertex. I wanted something that tracked my actual mastery — not just "you solved 47 problems" but "you haven't touched Graphs in 5 days and your mastery is decaying."

I came across Bayesian Knowledge Tracing while looking up how Khan Academy decides what to show you next. The math wasn't too scary once I sat with it — but I'll be honest, I used Claude to walk me through the probability update equations before I understood them well enough to implement them myself. I'd paste in what I thought the formula was doing, ask it to break down the intuition, then go back to the paper and re-read. That loop — paper, Claude, paper, code — was how I actually learned it. Not from any single source.

BKT models mastery as a probability. It starts low, updates after every attempt, and can go up or down depending on whether you got the question right. There's also decay: if you haven't practised something in a while, your score drops automatically. That felt right to me. Forgetting is real.

The algorithm is basically four numbers. p_init, p_transit, p_slip, p_guess. I ran the update equations against made-up data to see if they behaved how I expected. They did. That was genuinely exciting — watching a piece of math respond correctly to simulated learning felt different from just copying code off Stack Overflow.

What I didn't realise until I was halfway through: BKT is deterministic. There's no model training, no weights, no ML. It's just arithmetic running after every answer. I kept expecting something magical to happen, but it's honestly an elegant piece of logic that compounds meaningfully over sessions. The "AI" in Vertex is the LLM grading your written answers and the RAG pulling from your own notes — the BKT engine itself is pure math.

Building the prerequisite graph was the part I found most interesting. I mapped 40 DSA concepts and defined which ones unlock which. You don't get to attempt Dijkstra until your Graph BFS mastery crosses 40%. That felt like something missing from every other tool — a sense that knowledge has a shape, not just a list.

The RAG piece was where I leaned hardest on things I only half understood. I used Claude to help debug my chunking logic and understand why my retrieval was returning irrelevant context. It would explain what was wrong, I'd fix it, break something else, and repeat. The final implementation — sentence-transformers for embeddings, ChromaDB for storage, query-time retrieval — works well in practice, though I'm still not fully confident I'm chunking optimally. That's something I want to go back to.

Using AI this way taught me something: it's genuinely useful when you're the one driving. When I pasted code and said "fix this," I'd get something that worked but I didn't understand. When I pasted code and said "explain what's wrong," I'd learn. The difference in those two prompts is, I think, the difference between using AI well and using it as a crutch.

If I rebuilt this, I'd separate user state properly from the start. There's a hardcoded user ID in places I keep meaning to fix. Authentication is a whole thing I skipped to keep things moving. The ChromaDB collections are also global instead of per-user — two people uploading notes would bleed into each other. I know this. It's on the list.

But the core thing — adaptive question selection, mastery decay, LLM grading, mock interview mode — that all works. I've used it myself. It genuinely sends you back to your weak spots.

I built this to scratch my own itch. I think that's still the right reason to build things.`,
  },
  {
    slug: 'production-lessons',
    title: 'What production taught me that staging never did',
    titleParts: {
      before: 'What production taught me that ',
      italic: 'staging never did',
      after: '',
    },
    date: 'May 2026',
    category: 'Essay',
    body: `What production taught me that staging never did

My first three projects all broke in production. Not catastrophically — more like a slow leak. Things that worked perfectly on my machine, in my Conda environment, with my exact Python version, suddenly didn't. That gap between "it works locally" and "it works" is where the actual learning happens.

The first hit was DEADZONE. The death heatmap — one of the features I was most proud of — returned a 500 error the moment I deployed to Railway. Locally it rendered fine. On the server, matplotlib wasn't installed. I hadn't included it in requirements.txt because I'd been using it from a base Anaconda environment that had everything pre-loaded. I didn't even know that was a thing I could accidentally rely on. Fixed in two minutes once I understood the problem. Took me an hour to figure out what the problem even was.

Then the logs. FastAPI on Render was swallowing my print statements. I'd add a debug log, deploy, watch the behaviour, see nothing in the output. Thought the endpoint wasn't being hit. Turns out Python buffers stdout by default and Render wasn't flushing it. One environment variable — PYTHONUNBUFFERED=1 — fixed it. I found the answer by describing the symptom to Claude. It gave me three possible causes ranked by likelihood. Buffering was first on the list. I still had to confirm it myself, but knowing what to search for cut the debugging time in half.

The OpsPilot migration was where production got genuinely uncomfortable. I'd built the first version as a flat ticketing system and it was live on Render when I decided the schema needed to change — department-driven, role-based, with a proper state machine. That means writing Alembic migrations against data that already existed. I dropped columns I thought were unused. One wasn't. I learned what it feels like to run a migration, watch it succeed, and then have an endpoint 500 because a field it depended on was gone. Nothing in local development teaches you that specific anxiety.

I used Claude to think through the state machine before rewriting anything. Not to generate the code — to work through the edge cases first. I described the workflow and it asked what should happen when a manager tries to assign a ticket that hasn't been approved yet. I realised I hadn't decided. That back-and-forth before writing a single line of the new schema saved me from discovering those gaps mid-migration on a live system. The code was mine. The list of things I hadn't thought through before writing it was longer than I expected.

DEADZONE's collision system taught me something different — the cost of letting complexity accumulate without boundaries. Collision logic was scattered across player.py, zombie.py, bullet.py. Everything calling everything. I hit a circular import error and spent a long time shuffling imports around before understanding that the error was a symptom, not the cause. The cause was that my architecture had no walls. Centralising all of it into collision.py — returning just a hit count — eliminated the import issue entirely and made the whole thing dramatically easier to reason about. That's a pattern I'd read about in articles but didn't understand until I felt the specific pain it solves.

I still have debt I haven't paid off. The hardcoded user ID in Vertex. The global ChromaDB collection that doesn't separate users. A test suite in OpsPilot that covers most cases but not all of them. I know exactly where the gaps are. I think that's what actually matters — not zero debt, but knowing precisely what you owe and why.

Production is a specific kind of pressure. Things that are fine in isolation stop being fine when they have to run unattended, without your environment, against systems that don't forgive missing dependencies or half-finished migrations. I don't think you can fully learn that anywhere except by being there.`,
  },
]

export function getNoteBySlug(slug: string): Note | undefined {
  return NOTES.find((note) => note.slug === slug)
}

export function getAllNotes(): Note[] {
  return [...NOTES].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}