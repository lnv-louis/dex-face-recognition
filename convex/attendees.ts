import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Upload multiple attendees from Apify output
export const uploadAttendees = mutation({
  args: {
    profiles: v.array(v.any()), // Array of Apify profile objects
  },
  handler: async (ctx, args) => {
    const insertedIds = [];
    
    for (const profile of args.profiles) {
      // Check if already exists
      const existing = await ctx.db
        .query("attendees")
        .withIndex("by_publicIdentifier", (q) =>
          q.eq("publicIdentifier", profile.publicIdentifier)
        )
        .first();
      
      if (existing) {
        console.log(`Skipping duplicate: ${profile.fullName}`);
        continue;
      }
      
      // Insert new attendee
      const id = await ctx.db.insert("attendees", {
        linkedinUrl: profile.linkedinUrl || "",
        firstName: profile.firstName || undefined,
        lastName: profile.lastName || undefined,
        fullName: profile.fullName || "Unknown",
        headline: profile.headline || undefined,
        connections: profile.connections || undefined,
        followers: profile.followers || undefined,
        email: profile.email || undefined,
        jobTitle: profile.jobTitle || undefined,
        companyName: profile.companyName || undefined,
        profilePic: profile.profilePic || undefined,
        profilePicHighQuality: profile.profilePicHighQuality || undefined,
        about: profile.about || undefined,
        publicIdentifier: profile.publicIdentifier || "",
        addressCountryOnly: profile.addressCountryOnly || undefined,
        addressWithCountry: profile.addressWithCountry || undefined,
        addressWithoutCountry: profile.addressWithoutCountry || undefined,
        currentJobDuration: profile.currentJobDuration || undefined,
        rawProfile: JSON.stringify(profile),
      });
      
      insertedIds.push(id);
    }
    
    return {
      success: true,
      inserted: insertedIds.length,
      skipped: args.profiles.length - insertedIds.length,
    };
  },
});

// Get all attendees
export const getAllAttendees = query({
  handler: async (ctx) => {
    const attendees = await ctx.db.query("attendees").collect();
    return attendees.map((a) => ({
      ...a,
      rawProfile: JSON.parse(a.rawProfile),
    }));
  },
});

// Get single attendee by public identifier
export const getAttendeeByIdentifier = query({
  args: { publicIdentifier: v.string() },
  handler: async (ctx, args) => {
    const attendee = await ctx.db
      .query("attendees")
      .withIndex("by_publicIdentifier", (q) =>
        q.eq("publicIdentifier", args.publicIdentifier)
      )
      .first();
    
    if (!attendee) return null;
    
    return {
      ...attendee,
      rawProfile: JSON.parse(attendee.rawProfile),
    };
  },
});

// Get attendee count
export const getAttendeeCount = query({
  handler: async (ctx) => {
    const attendees = await ctx.db.query("attendees").collect();
    return attendees.length;
  },
});

// Clear all attendees (for testing)
export const clearAllAttendees = mutation({
  handler: async (ctx) => {
    const attendees = await ctx.db.query("attendees").collect();
    for (const attendee of attendees) {
      await ctx.db.delete(attendee._id);
    }
    return { deleted: attendees.length };
  },
});

