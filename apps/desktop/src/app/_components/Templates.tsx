"use client";

import { useState, useMemo } from "react";
import {
  useTemplateStore,
  useTemplateStoreWithStorageDOMEvents,
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
import { PlusCircle, Trash2, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";

function TemplateCard({
  template,
  onEdit,
  onDelete,
}: {
  template: Template;
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
        <div>
          <Button variant="ghost" size="sm" onClick={() => onEdit(template)}>
            <Edit className="h-4 w-4" />
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
  template: Template | null;
  onSave: (template: Omit<Template, "id" | "isDefault">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(template?.name || "");
  const [content, setContent] = useState(template?.content || "");
  const [type, setType] = useState<TemplateType>(template?.type || "generic");

  const handleSave = () => {
    onSave({
      name,
      content,
      type,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="type">Type</Label>
        <Select
          value={type}
          onValueChange={(value: TemplateType) => setType(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="generic">Generic</SelectItem>
            <SelectItem value="morningIntention">Morning Intention</SelectItem>
            <SelectItem value="eveningReflection">
              Evening Reflection
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}

function DefaultTemplateSelector({
  type,
  templates,
  onSetDefault,
}: {
  type: TemplateType;
  templates: Template[];
  onSetDefault: (id: string) => void;
}) {
  const typeTemplates = templates.filter((t) => t.type === type);
  const defaultTemplate = typeTemplates.find((t) => t.isDefault);

  return (
    <div className="mb-4">
      <Label htmlFor={`default-${type}`}>Default {type} template</Label>
      <Select
        value={defaultTemplate?.id}
        onValueChange={(value) => onSetDefault(value)}
      >
        <SelectTrigger id={`default-${type}`}>
          <SelectValue placeholder={`Select default ${type} template`} />
        </SelectTrigger>
        <SelectContent>
          {typeTemplates.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
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
    setDefaultTemplate,
  } = useTemplateStore();
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const templateTypes: TemplateType[] = useMemo(
    () => ["generic", "morningIntention", "eveningReflection"],
    [],
  );

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

  const handleSave = (template: Omit<Template, "id" | "isDefault">) => {
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

  const handleSetDefault = (id: string) => {
    setDefaultTemplate(id);
    toast({
      title: "Default template set",
      description: "The selected template is now the default for its type.",
      duration: 3000,
    });
  };

  return (
    <Card className="h-full flex flex-col border-none">
      <CardHeader>
        <CardTitle>Templates</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto px-6">
        {templateTypes.map((type) => (
          <DefaultTemplateSelector
            key={type}
            type={type}
            templates={templates}
            onSetDefault={handleSetDefault}
          />
        ))}
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
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
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Edit Template" : "Add New Template"}
              </DialogTitle>
            </DialogHeader>
            <TemplateForm
              template={editingTemplate}
              onSave={handleSave}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
