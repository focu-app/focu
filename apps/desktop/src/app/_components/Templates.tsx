"use client";

import { useState, useMemo } from "react";
import {
  useTemplateStore,
  Template,
  TemplateType,
} from "../store/templateStore";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { useToast } from "@repo/ui/hooks/use-toast";
import { PlusCircle, Trash2, Edit, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import { cn } from "@repo/ui/lib/utils";

function TemplateCard({
  template,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  template: Template;
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
  onDuplicate: (template: Template) => void;
}) {
  return (
    <Card
      className={cn(
        "mb-4",
        template.isActive ? "border-2 border-green-300 bg-green-50" : "",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
        <div>
          {!template.isDefault && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(template)}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(template)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          {!template.isDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(template.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">Type: {template.type}</p>
        <p className="text-sm mt-2">{template.content.substring(0, 100)}...</p>
      </CardContent>
    </Card>
  );
}

function TemplateForm({
  template,
  onSave,
  onCancel,
}: {
  template: Partial<Template> & { type: TemplateType };
  onSave: (template: Omit<Template, "id" | "isDefault" | "isActive">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(template?.name || "");
  const [content, setContent] = useState(template?.content || "");
  const type = template.type;

  const handleSave = () => {
    onSave({
      name,
      content,
      type,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 flex-shrink-0">
        <div>
          <Label>Type</Label>
          <p className="text-sm text-muted-foreground">
            {type === "generic"
              ? "Generic"
              : type === "morningIntention"
                ? "Morning Intention"
                : "Evening Reflection"}
          </p>
        </div>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-grow flex flex-col mt-4">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-grow resize-none"
        />
      </div>
      <div className="flex justify-end space-x-2 mt-4 flex-shrink-0">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}

function ActiveTemplateSelector({
  type,
  templates,
  onSetActive,
}: {
  type: TemplateType;
  templates: Template[];
  onSetActive: (id: string) => void;
}) {
  const typeTemplates = templates.filter((t) => t.type === type);
  const activeTemplate = typeTemplates.find((t) => t.isActive);

  return (
    <div className="mb-4">
      <Label htmlFor={`active-${type}`}>Active template</Label>
      <Select
        value={activeTemplate?.id}
        onValueChange={(value) => onSetActive(value)}
      >
        <SelectTrigger id={`active-${type}`}>
          <SelectValue placeholder={"Select active template"} />
        </SelectTrigger>
        <SelectContent>
          {typeTemplates.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name} {t.isDefault ? "(Default)" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function Templates() {
  const {
    templates,
    addTemplate,
    removeTemplate,
    updateTemplate,
    setActiveTemplate,
  } = useTemplateStore();
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const templateTypes: TemplateType[] = useMemo(
    () => ["generic", "morningIntention", "eveningReflection"],
    [],
  );

  const [activeTab, setActiveTab] = useState<TemplateType>("generic");

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const template = templates.find((t) => t.id === id);
    if (template && !template.isDefault) {
      removeTemplate(id);
      toast({
        title: "Template deleted",
        description: "The template has been removed.",
        duration: 3000,
      });
    } else {
      toast({
        title: "Cannot delete default template",
        description: "Default templates cannot be deleted.",
        duration: 3000,
      });
    }
  };

  const handleSave = (
    template: Omit<Template, "id" | "isDefault" | "isActive">,
  ) => {
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, template);
      toast({
        title: "Template updated",
        description: "The template has been updated successfully.",
        duration: 3000,
      });
    } else {
      addTemplate(template);
      toast({
        title: "Template added",
        description: "The new template has been added successfully.",
        duration: 3000,
      });
    }
    setIsDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleSetActive = (id: string) => {
    setActiveTemplate(id);
    toast({
      title: "Active template set",
      description: "The selected template is now active for its type.",
      duration: 3000,
    });
  };

  const handleDuplicate = (template: Template) => {
    const newTemplate = {
      ...template,
      name: `${template.name} (Copy)`,
      isDefault: false,
    };
    addTemplate(newTemplate);
    toast({
      title: "Template duplicated",
      description: "A copy of the template has been created.",
      duration: 3000,
    });
  };

  return (
    <Card className="h-full flex flex-col border-none">
      <CardHeader>
        <CardTitle>Templates</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto px-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TemplateType)}
        >
          <TabsList className="grid w-full grid-cols-3">
            {templateTypes.map((type) => (
              <TabsTrigger key={type} value={type}>
                {type === "generic"
                  ? "Generic"
                  : type === "morningIntention"
                    ? "Morning"
                    : "Evening"}
              </TabsTrigger>
            ))}
          </TabsList>
          {templateTypes.map((type) => (
            <TabsContent key={type} value={type}>
              <ActiveTemplateSelector
                type={type}
                templates={templates}
                onSetActive={handleSetActive}
              />
              {templates
                .filter((template) => template.type === type)
                .sort((a, b) =>
                  a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1,
                )
                .map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                  />
                ))}
            </TabsContent>
          ))}
        </Tabs>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingTemplate(null);
                setIsDialogOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[80vw] w-[80vw] max-h-[80vh] h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Edit Template" : "Add New Template"}
              </DialogTitle>
            </DialogHeader>
            <TemplateForm
              template={editingTemplate || ({ type: activeTab } as Template)}
              onSave={handleSave}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
