import { NextResponse } from 'next/server'
import { getAllWebsites } from './utilities'
import type { WebsitesResTYPE } from '@/types/api.type';


export async function GET() {
    try {
        const result = await getAllWebsites();
        return NextResponse.json(result);
        
    } catch (error) {
        const typedError = error as WebsitesResTYPE;
        console.log('error => ', error);
        return NextResponse.json({
            SUCCESS: false,
            MESSAGE: typedError.MESSAGE,
        }, {
            status: 500
        });
    }
}
