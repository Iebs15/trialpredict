import React, { useState } from 'react';
import { Edit3, Save, X, Copy, Trash2, Plus } from 'lucide-react';
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
  onViewBiomarkerData
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(treatment.name);

  const handleSaveName = () => {
    if (editedName.trim()) {
      onUpdate(treatment.id, { ...treatment, name: editedName.trim() });
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setEditedName(treatment.name);
      setIsEditing(false);
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
    const updatedBiomarkers = [...treatment.biomarkers, { name: "" }];
    onUpdate(treatment.id, { ...treatment, biomarkers: updatedBiomarkers });
  };

  const validBiomarkersCount = treatment.biomarkers.filter(b => b.name.trim()).length;

  return (
    <div className={`bg-white rounded-xl p-6 border-2 transition-all duration-300 shadow-sm hover:shadow-md min-w-0 ${
      isSelected 
        ? 'border-blue-300 bg-blue-50/30 ring-2 ring-blue-100' 
        : 'border-slate-200 hover:border-slate-300'
    }`}>
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
                onKeyDown={handleKeyPress}
                className="text-lg font-bold bg-white border-2 border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 flex-1 min-w-0"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors flex-shrink-0"
              >
                <Save className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setEditedName(treatment.name);
                  setIsEditing(false);
                }}
                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 group min-w-0">
              <h3 className="text-lg font-bold text-slate-800 truncate">{treatment.name}</h3>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                title="Edit name"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onDuplicate(treatment.id)}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Duplicate treatment"
          >
            <Copy className="h-4 w-4" />
          </button>
          {canRemove && (
            <button
              onClick={() => onRemove(treatment.id)}
              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove treatment"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4">
        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {validBiomarkersCount} biomarkers
        </span>
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
            condition="Aging" // Fixed condition since dropdown is removed
            treatmentId={treatment.id}
            onViewData={onViewBiomarkerData}
          />
        ))}
        
        <button
          onClick={addBiomarker}
          className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 group"
        >
          <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Add Biomarker</span>
        </button>
      </div>
    </div>
  );
};

export default TreatmentCard;