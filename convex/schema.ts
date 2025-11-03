import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Store LinkedIn attendee profiles
  attendees: defineTable({
    linkedinUrl: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    fullName: v.string(),
    headline: v.optional(v.string()),
    connections: v.optional(v.number()),
    followers: v.optional(v.number()),
    email: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    companyName: v.optional(v.string()),
    profilePic: v.optional(v.string()),
    profilePicHighQuality: v.optional(v.string()),
    about: v.optional(v.string()),
    publicIdentifier: v.string(),
    addressCountryOnly: v.optional(v.string()),
    addressWithCountry: v.optional(v.string()),
    addressWithoutCountry: v.optional(v.string()),
    currentJobDuration: v.optional(v.string()),
    
    // Store entire profile as JSON for flexibility
    rawProfile: v.string(), // JSON stringified
  }).index("by_publicIdentifier", ["publicIdentifier"])
    .index("by_linkedinUrl", ["linkedinUrl"]),

  // Store pre-computed face embeddings for fast matching
  faceEmbeddings: defineTable({
    attendeeId: v.id("attendees"),
    publicIdentifier: v.string(),
    embedding: v.string(), // JSON stringified array of floats
    imageUrl: v.string(),
    computedAt: v.number(), // timestamp
  }).index("by_attendeeId", ["attendeeId"])
    .index("by_publicIdentifier", ["publicIdentifier"]),
});

