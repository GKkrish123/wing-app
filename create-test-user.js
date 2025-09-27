const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // You'll need to replace this with your actual Supabase user ID
    // You can find this in the Supabase dashboard under Authentication > Users
    const supabaseUserId = "YOUR_SUPABASE_USER_ID_HERE"
    
    if (supabaseUserId === "YOUR_SUPABASE_USER_ID_HERE") {
      console.log("Please replace YOUR_SUPABASE_USER_ID_HERE with your actual Supabase user ID")
      console.log("You can find this in the Supabase dashboard under Authentication > Users")
      return
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: supabaseUserId }
    })

    if (existingUser) {
      console.log("User already exists in database:", existingUser)
      return
    }

    // Create the user
    const user = await prisma.user.create({
      data: {
        id: supabaseUserId,
        name: "Test User", // You can change this
        hasCompletedOnboarding: false,
        isLocationEnabled: false,
      }
    })

    console.log("Created user:", user)
    console.log("User can now go through the onboarding flow")

  } catch (error) {
    console.error("Error creating user:", error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
