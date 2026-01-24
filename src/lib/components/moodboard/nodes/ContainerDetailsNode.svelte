<script lang="ts">
    import type { MoodboardNode } from "$lib/types/domain/moodboard";
    import type { CustomField, ContainerDetailsMetadata } from "$lib/types/domain/moodboard";
    import { FileText, Plus, X, Check, Edit2 } from "lucide-svelte";
    import { Button, Input, Textarea, Checkbox, Label } from "flowbite-svelte";

    interface Props {
        node: MoodboardNode;
        onUpdate?: (updates: Partial<MoodboardNode>) => void;
    }

    let { node, onUpdate }: Props = $props();

    const metadata = $derived(
        node.metadata && typeof node.metadata === "object"
            ? node.metadata as ContainerDetailsMetadata
            : {} as ContainerDetailsMetadata
    );

    let customFields = $state<CustomField[]>(metadata.custom_fields || []);
    let description = $state(metadata.description || "");
    let isAddingField = $state(false);
    let editingFieldId = $state<string | null>(null);

    // New field form state
    let newFieldLabel = $state("");
    let newFieldType = $state<CustomField["type"]>("text");

    function addCustomField() {
        if (!newFieldLabel.trim()) return;

        const newField: CustomField = {
            id: crypto.randomUUID(),
            label: newFieldLabel,
            type: newFieldType,
            value: newFieldType === "checkbox" ? false : "",
            placeholder: "",
        };

        customFields = [...customFields, newField];
        saveFields();

        // Reset form
        newFieldLabel = "";
        newFieldType = "text";
        isAddingField = false;
    }

    function removeField(fieldId: string) {
        customFields = customFields.filter(f => f.id !== fieldId);
        saveFields();
    }

    function updateFieldValue(fieldId: string, value: string | number | boolean) {
        customFields = customFields.map(f =>
            f.id === fieldId ? { ...f, value } : f
        );
        saveFields();
    }

    function saveFields() {
        const updatedMetadata: ContainerDetailsMetadata = {
            ...metadata,
            custom_fields: customFields,
            description,
        };
        onUpdate?.({
            metadata: updatedMetadata,
        });
    }

    function saveDescription() {
        const updatedMetadata: ContainerDetailsMetadata = {
            ...metadata,
            description,
        };
        onUpdate?.({
            metadata: updatedMetadata,
        });
    }

    // Field type options
    const fieldTypeOptions: { value: CustomField["type"]; label: string }[] = [
        { value: "text", label: "Text" },
        { value: "textarea", label: "Long Text" },
        { value: "number", label: "Number" },
        { value: "checkbox", label: "Checkbox" },
        { value: "date", label: "Date" },
        { value: "url", label: "URL" },
    ];
</script>

<div class="space-y-4">
    <!-- Description -->
    <div>
        <Label class="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
            Description
        </Label>
        <Textarea
            bind:value={description}
            onblur={saveDescription}
            placeholder="Add a description for this container..."
            rows={3}
            class="text-sm"
        />
    </div>

    <!-- Character-specific info (if character container) -->
    {#if metadata.character_name}
        <div class="rounded-lg border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 p-3">
            <div class="flex items-center gap-2 mb-2">
                <FileText class="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <h4 class="text-sm font-semibold text-primary-900 dark:text-primary-100">
                    Character Info
                </h4>
            </div>
            <div class="space-y-1 text-xs text-primary-800 dark:text-primary-200">
                <div><span class="font-medium">Name:</span> {metadata.character_name}</div>
                {#if metadata.series_name}
                    <div><span class="font-medium">Series:</span> {metadata.series_name}</div>
                {/if}
                {#if metadata.variant}
                    <div><span class="font-medium">Variant:</span> {metadata.variant}</div>
                {/if}
            </div>
        </div>
    {/if}

    <!-- Custom Fields -->
    <div>
        <div class="flex items-center justify-between mb-2">
            <Label class="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Custom Fields
            </Label>
            {#if !isAddingField}
                <button
                    type="button"
                    onclick={() => isAddingField = true}
                    class="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                    <Plus class="w-3 h-3" />
                    Add Field
                </button>
            {/if}
        </div>

        <!-- Existing custom fields -->
        <div class="space-y-2">
            {#each customFields as field (field.id)}
                <div class="flex items-start gap-2 p-2 rounded bg-gray-50 dark:bg-gray-800">
                    <div class="flex-1">
                        <Label for={`field-${field.id}`} class="text-xs mb-1">
                            {field.label}
                        </Label>

                        {#if field.type === "textarea"}
                            <Textarea
                                id={`field-${field.id}`}
                                value={String(field.value)}
                                oninput={(e) => updateFieldValue(field.id, e.currentTarget.value)}
                                placeholder={field.placeholder}
                                rows={2}
                                class="text-sm"
                            />
                        {:else if field.type === "checkbox"}
                            <Checkbox
                                id={`field-${field.id}`}
                                checked={Boolean(field.value)}
                                onchange={(e) => updateFieldValue(field.id, e.currentTarget.checked)}
                            />
                        {:else if field.type === "number"}
                            <Input
                                id={`field-${field.id}`}
                                type="number"
                                value={field.value}
                                oninput={(e) => updateFieldValue(field.id, Number(e.currentTarget.value))}
                                placeholder={field.placeholder}
                                size="sm"
                            />
                        {:else}
                            <Input
                                id={`field-${field.id}`}
                                type={field.type === "url" ? "url" : field.type === "date" ? "date" : "text"}
                                value={String(field.value)}
                                oninput={(e) => updateFieldValue(field.id, e.currentTarget.value)}
                                placeholder={field.placeholder}
                                size="sm"
                            />
                        {/if}
                    </div>
                    <button
                        type="button"
                        onclick={() => removeField(field.id)}
                        class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Remove field"
                    >
                        <X class="w-4 h-4" />
                    </button>
                </div>
            {/each}
        </div>

        <!-- Add new field form -->
        {#if isAddingField}
            <div class="mt-2 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                <div class="space-y-2">
                    <div>
                        <Label for="new-field-label" class="text-xs mb-1">Field Name</Label>
                        <Input
                            id="new-field-label"
                            bind:value={newFieldLabel}
                            placeholder="e.g., Progress, Difficulty, Notes"
                            size="sm"
                        />
                    </div>
                    <div>
                        <Label for="new-field-type" class="text-xs mb-1">Field Type</Label>
                        <select
                            id="new-field-type"
                            bind:value={newFieldType}
                            class="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2"
                        >
                            {#each fieldTypeOptions as option}
                                <option value={option.value}>{option.label}</option>
                            {/each}
                        </select>
                    </div>
                    <div class="flex gap-2">
                        <Button
                            size="xs"
                            color="primary"
                            onclick={addCustomField}
                            disabled={!newFieldLabel.trim()}
                        >
                            <Check class="w-3 h-3 mr-1" />
                            Add
                        </Button>
                        <Button
                            size="xs"
                            color="light"
                            onclick={() => {
                                isAddingField = false;
                                newFieldLabel = "";
                                newFieldType = "text";
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        {/if}

        {#if customFields.length === 0 && !isAddingField}
            <p class="text-xs text-gray-500 dark:text-gray-400 italic text-center py-4">
                No custom fields yet. Click "Add Field" to create one.
            </p>
        {/if}
    </div>

    <!-- Budget tracking (optional) -->
    {#if metadata.estimated_budget !== undefined || metadata.actual_budget !== undefined}
        <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
            <h4 class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Budget
            </h4>
            <div class="grid grid-cols-2 gap-2 text-xs">
                {#if metadata.estimated_budget !== undefined}
                    <div>
                        <span class="text-gray-600 dark:text-gray-400">Estimated:</span>
                        <span class="font-medium text-gray-900 dark:text-white ml-1">
                            ${metadata.estimated_budget.toFixed(2)}
                        </span>
                    </div>
                {/if}
                {#if metadata.actual_budget !== undefined}
                    <div>
                        <span class="text-gray-600 dark:text-gray-400">Actual:</span>
                        <span class="font-medium text-gray-900 dark:text-white ml-1">
                            ${metadata.actual_budget.toFixed(2)}
                        </span>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>
