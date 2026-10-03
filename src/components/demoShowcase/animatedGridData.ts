export interface AnimatedGridRow {
  id: number;
  name: string;
  email: string;
  dept: string;
  status: 'Active' | 'Inactive' | 'Pending';
  salary: string;
  country: string;
}

const FIRST = ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Iris', 'James', 'Kate', 'Leo', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Rose', 'Sam', 'Tina'];
const LAST = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Taylor', 'Anderson', 'Clark', 'Lewis', 'Walker'];
const DEPTS = ['Engineering', 'Marketing', 'Sales', 'Finance', 'Design', 'Operations', 'Product'];
const STATUSES: AnimatedGridRow['status'][] = ['Active', 'Active', 'Active', 'Pending', 'Inactive'];
const COUNTRIES = ['USA', 'UK', 'Canada', 'Germany', 'India', 'Singapore', 'Japan'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateAnimatedRows(count: number): AnimatedGridRow[] {
  return Array.from({ length: count }, (_, i) => {
    const first = pick(FIRST);
    const last = pick(LAST);
    return {
      id: i + 1,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@corp.io`,
      dept: pick(DEPTS),
      status: pick(STATUSES),
      salary: `$${(Math.floor(Math.random() * 90 + 40) * 1000).toLocaleString()}`,
      country: pick(COUNTRIES),
    };
  });
}

export const STATUS_STYLE: Record<AnimatedGridRow['status'], string> = {
  Active: 'bg-emerald-400/15 text-emerald-300',
  Inactive: 'bg-red-400/15 text-red-300',
  Pending: 'bg-amber-400/15 text-amber-300',
};
