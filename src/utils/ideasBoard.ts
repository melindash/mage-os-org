import roadmapSnapshot from '~/data/ideas-roadmap.json';

export type IdeaStatusId = 'open' | 'underreview' | 'planned' | 'started' | 'completed' | 'declined' | 'duplicate';

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
    label: 'Submitted',
    description: 'Open for discussion and votes. No decision has been made.',
    icon: 'tabler:bulb',
  },
  {
    id: 'underreview',
    label: 'Under review',
    description: 'Maintainers are assessing scope, fit and who could do the work.',
    icon: 'tabler:zoom-question',
  },
  {
    id: 'planned',
    label: 'Approved priority',
    description: 'Approved as a priority. Timing still depends on contributor capacity.',
    icon: 'tabler:flag',
  },
  {
    id: 'started',
    label: 'In progress',
    description: 'Work is underway, usually tracked in a linked GitHub issue or pull request.',
    icon: 'tabler:progress',
  },
  {
    id: 'completed',
    label: 'Completed',
    description: 'Released or delivered. Merged code alone does not count as completed.',
    icon: 'tabler:circle-check',
  },
  {
    id: 'declined',
    label: 'Declined',
    description: 'Not pursued, with a reason given on the idea.',
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
    name: 'Security, performance, and compliance',
    slug: 'security-performance-compliance',
    description: 'Hardening, speed, accessibility and regulatory requirements.',
    examples: ['Patch delivery', 'Benchmarks', 'PCI DSS and privacy requirements'],
    icon: 'tabler:shield-check',
  },
  {
    name: 'Community and ecosystem',
    slug: 'community-ecosystem',
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
