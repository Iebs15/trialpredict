// src/components/TreatmentCard.jsx
import React, { useState } from 'react';
import { Edit3, Save, X, Copy, Trash2, Plus, Settings } from 'lucide-react';
import BiomarkerItem from './BiomarkerItem';

const TreatmentCard = ({
  treatment,
  onUpdate,
  onRemove,
  onDuplicate,
  canRemove = true,
  isSelected = false,
  onToggleSelect,
  availableBiomarkers = [],
  availableConditions = [],
  onViewBiomarkerData
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(treatment.name);
  const [isEditingCondition, setIsEditingCondition] = useState(false);
  const [editedCondition, setEditedCondition] = useState(treatment.condition);

  const handleSaveName = () => {
    if (editedName.trim()) {
      onUpdate(treatment.id, { ...treatment, name: editedName.trim() });
      setIsEditing(false);
    }
  };

  const handleSaveCondition = () => {
    if (editedCondition.trim()) {
      onUpdate(treatment.id, { ...treatment, condition: editedCondition.trim() });
      setIsEditingCondition(false);
    }
  };

  const handleKeyPress = (e, saveFunction) => {
    if (e.key === 'Enter') saveFunction();
    else if (e.key === 'Escape') {
      setEditedName(treatment.name);
      setEditedCondition(treatment.condition);
      setIsEditing(false);
      setIsEditingCondition(false);
    }
  };

  const updateBiomarker = (index, updatedBiomarker) => {
    const updatedBiomarkers = [...treatment.biomarkers];
    updatedBiomarkers[index] = updatedBiomarker;
    onUpdate(treatment.id, { ...treatment, biomarkers: updatedBiomarkers });
  };

  const removeBiomarker = (index) => {
    const updatedBiomarkers = treatment.biomarkers.filter((_, i) => i !== index);
    onUpdate(treatment.id, { ...treatment, biomarkers: updatedBiomarkers });
  };

  const addBiomarker = () => {
    const updatedBiomarkers = [...treatment.biomarkers, { name: '' }];
    onUpdate(treatment.id, { ...treatment, biomarkers: updatedBiomarkers });
  };

  const validBiomarkersCount = treatment.biomarkers.filter((b) => b.name.trim()).length;

  return (
    <div
      className={`bg-white rounded-xl p-6 border-2 transition-all duration-300 shadow-sm hover:shadow-md min-w-0 ${
        isSelected ? 'border-blue-300 bg-blue-50/30 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onToggleSelect(treatment.id, e.target.checked)}
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
          />

          {isEditing ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, handleSaveName)}
                className="text-lg font-bold bg-white border-2 border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 flex-1 min-w-0"
                autoFocus
              />
              <button onClick={handleSaveName} className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg">
                <Save className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setEditedName(treatment.name);
                  setIsEditing(false);
                }}
                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 group min-w-0">
              <h3 className="text-lg font-bold text-slate-800 truncate">{treatment.name}</h3>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100"
                title="Edit name"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => onDuplicate(treatment.id)} className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
            <Copy className="h-4 w-4" />
          </button>
          {canRemove && (
            <button onClick={() => onRemove(treatment.id)} className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Condition Section */}
      <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-700">Condition</label>
          <button
            onClick={() => setIsEditingCondition(!isEditingCondition)}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            title="Edit condition"
          >
            <Settings className="h-3 w-3" />
          </button>
        </div>
        
        {isEditingCondition ? (
          <div className="flex items-center gap-2">
            <select
              value={editedCondition}
              onChange={(e) => setEditedCondition(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, handleSaveCondition)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              autoFocus
            >
              <option value="">Select a condition</option>
              {availableConditions.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
            <button 
              onClick={handleSaveCondition} 
              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg"
              disabled={!editedCondition.trim()}
            >
              <Save className="h-3 w-3" />
            </button>
            <button
              onClick={() => {
                setEditedCondition(treatment.condition);
                setIsEditingCondition(false);
              }}
              className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              {treatment.condition || 'No condition selected'}
            </span>
            {!treatment.condition && (
              <span className="text-xs text-amber-600">⚠ Please select a condition</span>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {validBiomarkersCount} biomarkers
          </span>
          {treatment.condition && (
            <span className="text-xs text-slate-500">• Condition: {treatment.condition}</span>
          )}
        </div>
      </div>

      {/* Biomarkers */}
      <div className="space-y-4">
        {treatment.biomarkers.map((biomarker, index) => (
          <BiomarkerItem
            key={index}
            biomarker={biomarker}
            index={index}
            onUpdate={updateBiomarker}
            onRemove={removeBiomarker}
            availableBiomarkers={availableBiomarkers}
            condition={treatment.condition}
            treatmentId={treatment.id}
            onViewData={onViewBiomarkerData}
          />
        ))}

        <button
          onClick={addBiomarker}
          disabled={!treatment.condition}
          className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-300 disabled:hover:text-slate-600 disabled:hover:bg-transparent"
          title={!treatment.condition ? "Please select a condition first" : "Add biomarker"}
        >
          <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">
            {!treatment.condition ? "Select condition to add biomarkers" : "Add Biomarker"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default TreatmentCard;