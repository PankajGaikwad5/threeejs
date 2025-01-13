import mongoose from 'mongoose';

const TopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  images: { type: [String], required: true }, // Array of image URLs
  description: { type: String }, // Optional description
});

export default mongoose.models.Topic || mongoose.model('Topic', TopicSchema);
