/**
 * Drag and Drop Utilities for Moodboard
 * Task: T-015 enhancement
 * 
 * Handles moving nodes into and out of containers via drag-and-drop
 */

export interface DragData {
    nodeId: string;
    nodeType: string;
    isContainer: boolean;
}

export function canDropIntoContainer(draggedNode: DragData, targetContainerId: string): boolean {
    // Prevent dropping a container into itself
    if (draggedNode.nodeId === targetContainerId) {
        return false;
    }

    // Containers can only contain non-container nodes (flatten hierarchy in v1.0)
    // In future versions, we could allow nested containers
    if (draggedNode.isContainer) {
        return false;
    }

    return true;
}

export function encodeDragData(data: DragData): string {
    return JSON.stringify(data);
}

export function decodeDragData(dataString: string): DragData | null {
    try {
        return JSON.parse(dataString);
    } catch {
        return null;
    }
}
