/**
 * Tool Suggestion Form
 * Allows visitors to suggest new calculators or tools
 */

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Label } from '../ui/Label';
import { Send, CheckCircle } from 'lucide-react';

export const ToolSuggestionForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    toolName: '',
    description: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSubmitted(true);
    setSubmitting(false);

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ name: '', email: '', toolName: '', description: '' });
      setSubmitted(false);
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-green-900 mb-2">
          Thank You!
        </h3>
        <p className="text-green-700">
          We've received your suggestion and will review it shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Your Name *</Label>
          <Input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Smith"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="john@example.com"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="toolName">Suggested Tool/Calculator Name *</Label>
        <Input
          id="toolName"
          type="text"
          required
          value={formData.toolName}
          onChange={(e) =>
            setFormData({ ...formData, toolName: e.target.value })
          }
          placeholder="e.g., Renal Dose Calculator"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Description & Use Case *</Label>
        <Textarea
          id="description"
          required
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Describe the calculator/tool and how it would be useful in pharmacy practice..."
          rows={5}
          className="mt-1"
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full md:w-auto"
        size="lg"
      >
        {submitting ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Submit Suggestion
          </>
        )}
      </Button>
    </form>
  );
};
