import roadmapSnapshot from '~/data/ideas-roadmap.json';

export type IdeaStatusId =
  | 'open'
  | 'underreview'
  | 'planned'
  | 'started'
  | 'unclaimed'
  | 'parked'
  | 'completed'
  | 'declined'
  | 'duplicate';

export interface IdeaStatus {
  id: IdeaStatusId;
  label: string;
  description: string;
  icon: string;
}

export interface IdeaCategory {
  name: string;
  /** Must match the tag slug configured in Fider. */
  slug: string;
  description: string;
  examples: string[];
  icon: string;
}

export interface RoadmapIdea {
  number: number;
  title: string;
  slug: string;
  status: IdeaStatusId;
  votesCount: number;
  tags: string[];
}

export interface RoadmapSnapshot {
  fetchedAt: string | null;
  source: string | null;
  ideas: RoadmapIdea[];
}

// Placeholder hostname until Mage-OS approves DNS for the self-hosted board.
export const IDEAS_BOARD_URL = 'https://ideas.mage-os.org';

export const OPEN_COLLECTIVE_URL = 'https://opencollective.com/mage-os';

// The demo board's planned/started selections are not approved commitments.
// Flip this only after the board approves priorities, then run `npm run refresh:ideas`.
export const ROADMAP_PUBLISHED = false;

export const ROADMAP_STATUSES: IdeaStatusId[] = ['planned', 'started', 'completed'];

export const ideaStatuses: IdeaStatus[] = [
  {
    id: 'open',
    label: 'Idea',
    description: 'Submitted and open for discussion and votes. The Roadmap Team reviews new ideas every month.',
    icon: 'tabler:bulb',
  },
  {
    id: 'underreview',
    label: 'Under review',
    description: 'The Roadmap Team is deciding whether to accept, park or decline it.',
    icon: 'tabler:zoom-question',
  },
  {
    id: 'planned',
    label: 'Open for volunteers',
    description: 'Accepted, with a task card. Claim it with a comment and the Roadmap Team confirms.',
    icon: 'tabler:flag',
  },
  {
    id: 'started',
    label: 'In progress',
    description:
      'A volunteer has claimed it, usually with a linked pull request. Four weeks without visible progress reopens it.',
    icon: 'tabler:progress',
  },
  {
    id: 'unclaimed',
    label: 'Unclaimed',
    description: 'Nobody claimed it within four weeks. The Roadmap Team splits it, parks it or declines it.',
    icon: 'tabler:hourglass',
  },
  {
    id: 'parked',
    label: 'Parked',
    description: 'Set aside for now and kept on the list. It can come back at a later review.',
    icon: 'tabler:player-pause',
  },
  {
    id: 'completed',
    label: 'Done',
    description: 'Merged after Tech Team review, with tests, docs and a named maintainer.',
    icon: 'tabler:circle-check',
  },
  {
    id: 'declined',
    label: 'Declined',
    description: 'Not pursued, with a one-line reason given on the idea.',
    icon: 'tabler:circle-x',
  },
];

export const ideaCategories: IdeaCategory[] = [
  {
    name: 'Merchant experience',
    slug: 'merchant-experience',
    description: 'Storefront, admin and day-to-day commerce features for people running a shop.',
    examples: ['Checkout and catalog features', 'Admin usability', 'Reporting'],
    icon: 'tabler:building-store',
  },
  {
    name: 'Developer experience',
    slug: 'developer-experience',
    description: 'Tooling, APIs, documentation and workflows for people building on Mage-OS.',
    examples: ['CLI and installer improvements', 'Testing tools', 'Developer docs'],
    icon: 'tabler:code',
  },
  {
    name: 'Security and compliance',
    slug: 'security-and-compliance',
    description: 'Hardening, patch delivery, accessibility and regulatory requirements.',
    examples: ['Patch delivery', 'Accessibility', 'PCI DSS and privacy requirements'],
    icon: 'tabler:shield-check',
  },
  {
    name: 'Performance',
    slug: 'performance',
    description: 'Speed and scalability of the storefront, admin and infrastructure.',
    examples: ['Benchmarks', 'Caching and indexing', 'Page speed'],
    icon: 'tabler:gauge',
  },
  {
    name: 'Community and ecosystem',
    slug: 'community-and-ecosystem',
    description: 'Initiatives that grow the people around Mage-OS, not only the software.',
    examples: ['Ambassador program', 'Forums', 'Contributor profiles', 'Events and mentoring'],
    icon: 'tabler:users-group',
  },
];

export function ideaUrl(idea: Pick<RoadmapIdea, 'number' | 'slug'>): string {
  return `${IDEAS_BOARD_URL}/posts/${idea.number}/${idea.slug}`;
}

export function statusFor(id: IdeaStatusId): IdeaStatus | undefined {
  return ideaStatuses.find((status) => status.id === id);
}

export function getRoadmap(): RoadmapSnapshot & { published: boolean } {
  const snapshot = roadmapSnapshot as RoadmapSnapshot;
  return {
    ...snapshot,
    ideas: ROADMAP_PUBLISHED ? snapshot.ideas.filter((idea) => ROADMAP_STATUSES.includes(idea.status)) : [],
    published: ROADMAP_PUBLISHED,
  };
}
