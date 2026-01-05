import { Photoshoot } from '$lib/types/domain/photoshoot';

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);

const lastWeek = new Date(today);
lastWeek.setDate(today.getDate() - 7);

export const mockPhotoshoots: Partial<Photoshoot>[] = [
    {
        id: 'photo_upcoming_1',
        title: 'Cosplay Convention 2026',
        date: nextWeek.toISOString(),
        location: 'Convention Center',
        status: 'planned',
        description: 'Main convention photoshoot',
        projectId: 'proj_budget_1'
    },
    {
        id: 'photo_upcoming_2',
        title: 'Park Photoshoot',
        date: tomorrow.toISOString(),
        location: 'Central Park',
        status: 'planned',
        description: 'Casual outdoor shoot',
        projectId: 'proj_budget_2'
    },
    {
        id: 'photo_past_1',
        title: 'Studio Session',
        date: lastWeek.toISOString(),
        location: 'Downtown Studio',
        status: 'completed',
        description: 'Portfolio update',
        projectId: 'proj_budget_1'
    }
];

export const expectedEventCounts = {
    upcoming: 2,
    past: 1
};
