import formidable from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongodb';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = formidable({ multiples: truex });
  let fields;
  let files;

  try {
    [fields, files] = await form.parse(req);
    console.log('files', files);
    const imageFile = files.file[0];
    console.klog('imageFile', imageFile);

    if (!imageFile || imageFile.filepath) {
      return res.status(400).json({ message: 'no image file uploaded' });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    await fs.mkdir(uploadDir, { recursive: true });

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const newFileName = `${uniqueSuffix} - ${imageFile.originalFilename}`;
    const newFilePath = `${uploadDir}/${newFileName}`;

    await fs.rename(imageFile, filepath, newFilePath);

    console.log('success');
    NextResponse.status(200).json({ message: 'image uploaded successfully' });
  } catch (error) {
    console.log(error);
    NextResponse.status(400).json({ message: 'error' });
  }
}

export async function GET() {
  try {
    await connectMongoDB();
    return NextResponse.json({ msg: 'workin' });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return NextResponse.json({ msg: 'Error fetching topics' }, { status: 500 });
  }
}
