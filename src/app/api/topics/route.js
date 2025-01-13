import { NextResponse } from 'next/server';
import connectMongoDB from '../../lib/mongodb';
import Topic from '../../models/topic';

// export async function POST(request) {
//   try {
//     const { title, images, description } = await request.json();
//     if (!title || !images || images.length === 0) {
//       return NextResponse.json(
//         { msg: 'Title and at least one image are required' },
//         { status: 400 }
//       );
//     }

//     await connectMongoDB();
//     await Topic.create({ title, images, description });
//     return NextResponse.json({ msg: 'Topic Created' }, { status: 201 });
//   } catch (error) {
//     console.error('Error creating topic:', error);
//     return NextResponse.json({ msg: 'Error creating topic' }, { status: 500 });
//   }
// }
export async function POST(request) {
  const { title, images, description } = await request.json();
  // console.log('Title:', title);
  // console.log('Images:', images); // Expecting an array of image URLs
  // console.log('Description:', description);

  // Your MongoDB logic to store the data
  await connectMongoDB();
  await Topic.create({
    title,
    images, // Store the array of image URLs
    description,
  });

  return NextResponse.json({ msg: 'Topic Created' }, { status: 201 });
}

export async function GET() {
  try {
    await connectMongoDB();
    const topics = await Topic.find();
    return NextResponse.json({ topics });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json({ msg: 'Error fetching topics' }, { status: 500 });
  }
}
