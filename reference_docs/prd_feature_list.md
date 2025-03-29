
## Overview

NextWorkout is a simple web app that helps users track workouts and structure their next workout. 

**User**

The user has a defined set of exercises, broken down into different groups (such as upper body, lower body, stretching, etc). Each workout, the user will do a subset of exercises, but there’s not a consistent schedule or routine. However, over time, the user wants to have proper coverage of all their exercises in each group. For example, let’s say a user has three upper-body workouts: A, B, and C. If their past two workouts included A and B respectively, they probably want their next workout to include C.

**App**

NextWorkout will allow the user to create exercise groups, add exercises to those groups, and then record which exercises they perform in a given workout. It will show the exercises in each group that it has been the longest since the user performed.

(leaving out “It will provide a historical view of which exercises have been performed” bc I don’t fully know yet what I want this to look like)

## Features

As a user, I want to be able to track my workouts and structure my next workout based on exercises that I haven't performed in a while.

- **Login**: Users can log in to their account where data will persist.
- **Logout**: Users can log out of their account, restricting access to only the homepage.
- **Create Exercise Groups**: Users can create named exercise groups such as "Upper Body", "Lower Body", or "Stretching".
- **Re-order Exercise Groups**: Users can change the order in which exercise groups appear
- **Update Exercise Groups**: Users can update the description and color of an exercise group
- **Remove Exercise Group**: Users have the option to remove an exercise group entirely, with the ability to move contained exercises to another group or delete them.
- **Change Group Color**: The color of each exercise group and its contained exercises can be customized by the user.
- **Create Exercises:** Users can add exercises to each exercise group, including details on the number of sets and reps to be performed.
- **Update Exercise**: Users can update the name and description of an exercise.
- **Remove Exercise**: Users can easily remove an exercise from their list.
- **Move Exercise**: Exercises can be moved from one group to another for better organization.
- **Next Exercises View**: A view that shows the exercises in each group that it has been the longest since the user performed.
- **Dynamic N**: The ability for users to change the number of exercises shown for each group in the "Next Exercises View".
- **Add Workout**: Users can add a workout, where they select which exercises they performed and for how many sets.
- **View Workouts**: Users can view all past workouts.