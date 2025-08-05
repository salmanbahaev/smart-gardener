import mongoose, { Schema, models } from "mongoose";

const PlantSchema = new Schema({
  plantId: { type: Schema.Types.ObjectId, required: true },
  virtualLevel: { type: Number, default: 1, min: 1, max: 100 },
  lastAction: { type: Date, default: Date.now },
  achievements: [{ type: Schema.Types.ObjectId, ref: 'Achievement' }],
  name: { type: String, default: "Растение" },
  type: { type: String, default: "unknown" },
  health: { type: Number, default: 100, min: 0, max: 100 },
  lastWatered: { type: Date, default: Date.now },
  lastFertilized: { type: Date, default: Date.now },
  lastPruned: { type: Date, default: Date.now }
});

const GardenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  plants: [PlantSchema],
  currency: { type: Number, default: 0, min: 0 }, // "листочки"
  totalLevel: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Обновляем updatedAt при каждом изменении
GardenSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Виртуальное поле для среднего уровня растений
GardenSchema.virtual('averageLevel').get(function() {
  if (this.plants.length === 0) return 0;
  const totalLevel = this.plants.reduce((sum, plant) => sum + plant.virtualLevel, 0);
  return Math.round(totalLevel / this.plants.length);
});

export const Garden = models.Garden || mongoose.model("Garden", GardenSchema); 