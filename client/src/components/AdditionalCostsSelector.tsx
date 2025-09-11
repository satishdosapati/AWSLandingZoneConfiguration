/**
 * Additional Costs Selector Component
 * 
 * Allows users to add, edit, and remove additional cost items that will be
 * included in the professional services cost calculation. Each additional cost
 * has a description and amount.
 * 
 * Features:
 * - Add multiple additional cost items
 * - Edit existing cost items inline
 * - Remove cost items with confirmation
 * - Real-time validation and error handling
 * - Responsive design with proper spacing
 * 
 * @version 1.0.0
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdditionalCost } from "@shared/schema";
import { Plus, Trash2, Edit2, Check, X, DollarSign } from "lucide-react";

/**
 * Props interface for AdditionalCostsSelector component
 */
interface AdditionalCostsSelectorProps {
  additionalCosts: AdditionalCost[];
  onAdditionalCostsChange: (costs: AdditionalCost[]) => void;
}

export default function AdditionalCostsSelector({ 
  additionalCosts, 
  onAdditionalCostsChange 
}: AdditionalCostsSelectorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCost, setNewCost] = useState({ description: "", amount: "" });
  const [editingCost, setEditingCost] = useState({ description: "", amount: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateCost = (description: string, amount: string) => {
    const newErrors: Record<string, string> = {};
    
    if (!description.trim()) {
      newErrors.description = "Description is required";
    }
    
    if (!amount.trim()) {
      newErrors.amount = "Amount is required";
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount < 0) {
        newErrors.amount = "Amount must be a valid non-negative number";
      }
    }
    
    return newErrors;
  };

  const handleAddCost = () => {
    const validationErrors = validateCost(newCost.description, newCost.amount);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const cost: AdditionalCost = {
      id: crypto.randomUUID(),
      description: newCost.description.trim(),
      amount: parseFloat(newCost.amount),
    };

    onAdditionalCostsChange([...additionalCosts, cost]);
    setNewCost({ description: "", amount: "" });
    setErrors({});
  };

  const handleEditCost = (id: string) => {
    const cost = additionalCosts.find(c => c.id === id);
    if (cost) {
      setEditingCost({ description: cost.description, amount: cost.amount.toString() });
      setEditingId(id);
      setErrors({});
    }
  };

  const handleSaveEdit = () => {
    if (!editingId) return;

    const validationErrors = validateCost(editingCost.description, editingCost.amount);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const updatedCosts = additionalCosts.map(cost =>
      cost.id === editingId
        ? {
            ...cost,
            description: editingCost.description.trim(),
            amount: parseFloat(editingCost.amount),
          }
        : cost
    );

    onAdditionalCostsChange(updatedCosts);
    setEditingId(null);
    setEditingCost({ description: "", amount: "" });
    setErrors({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingCost({ description: "", amount: "" });
    setErrors({});
  };

  const handleRemoveCost = (id: string) => {
    onAdditionalCostsChange(additionalCosts.filter(cost => cost.id !== id));
  };

  const totalAdditionalCosts = additionalCosts.reduce((sum, cost) => sum + cost.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Additional Professional Services Costs
        </CardTitle>
        <CardDescription>
          Add any additional professional services costs with custom descriptions. 
          These will be included in your total professional services cost.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Cost Form */}
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm">Add Additional Cost</h4>
          <div className="grid gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                placeholder="e.g., Custom security assessment, Migration planning, Training sessions"
                value={newCost.description}
                onChange={(e) => setNewCost(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[60px]"
                data-testid="input-additional-cost-description"
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Amount ($)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={newCost.amount}
                onChange={(e) => setNewCost(prev => ({ ...prev, amount: e.target.value }))}
                min="0"
                step="0.01"
                data-testid="input-additional-cost-amount"
              />
              {errors.amount && (
                <p className="text-sm text-red-600 mt-1">{errors.amount}</p>
              )}
            </div>
            <Button 
              onClick={handleAddCost}
              size="sm"
              className="w-fit"
              data-testid="button-add-additional-cost"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Cost
            </Button>
          </div>
        </div>

        {/* Existing Costs List */}
        {additionalCosts.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Additional Costs ({additionalCosts.length})</h4>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  Total: ${totalAdditionalCosts.toLocaleString()}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {additionalCosts.map((cost) => (
                  <div
                    key={cost.id}
                    className="flex items-start gap-3 p-3 bg-background border rounded-lg"
                  >
                    {editingId === cost.id ? (
                      // Edit Mode
                      <div className="flex-1 space-y-2">
                        <div>
                          <Textarea
                            value={editingCost.description}
                            onChange={(e) => setEditingCost(prev => ({ ...prev, description: e.target.value }))}
                            className="min-h-[50px] text-sm"
                            data-testid={`input-edit-description-${cost.id}`}
                          />
                          {errors.description && (
                            <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={editingCost.amount}
                            onChange={(e) => setEditingCost(prev => ({ ...prev, amount: e.target.value }))}
                            className="w-32"
                            min="0"
                            step="0.01"
                            data-testid={`input-edit-amount-${cost.id}`}
                          />
                          {errors.amount && (
                            <p className="text-sm text-red-600">{errors.amount}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            data-testid={`button-save-edit-${cost.id}`}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            data-testid={`button-cancel-edit-${cost.id}`}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium mb-1">{cost.description}</p>
                          <p className="text-sm text-muted-foreground">
                            ${cost.amount.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCost(cost.id)}
                            data-testid={`button-edit-${cost.id}`}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveCost(cost.id)}
                            data-testid={`button-remove-${cost.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Summary Alert */}
        {totalAdditionalCosts > 0 && (
          <Alert>
            <DollarSign className="h-4 w-4" />
            <AlertDescription>
              Additional costs will add <strong>${totalAdditionalCosts.toLocaleString()}</strong> to your 
              total professional services cost.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
