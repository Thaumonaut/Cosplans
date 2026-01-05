import { Project } from '$lib/types/domain/project';

export const mockBudgetProjects: Partial<Project>[] = [
    {
        id: 'proj_budget_1',
        title: 'Budget Project 1',
        character: 'Budget Character 1',
        series: 'Budget Series',
        estimatedBudget: 50000, // $500.00
        spentBudget: 25000,    // $250.00
        status: 'in-progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'proj_budget_2',
        title: 'Budget Project 2',
        character: 'Budget Character 2',
        series: 'Budget Series',
        estimatedBudget: 10000, // $100.00
        spentBudget: 0,        // $0.00
        status: 'planning',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'proj_budget_3',
        title: 'Budget Project 3',
        character: 'Budget Character 3',
        series: 'Budget Series',
        estimatedBudget: 0,     // $0.00
        spentBudget: 15000,     // $150.00 (Over budget)
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

export const expectedBudgetTotals = {
    totalBudget: 60000, // $600.00
    totalSpent: 40000,  // $400.00
    remaining: 20000    // $200.00
};
