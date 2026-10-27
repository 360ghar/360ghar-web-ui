import type { APIRoute, GetStaticPaths } from 'astro';
import { DIORAMA_LAYERS } from '@/features/home/diorama/layers';

export const prerender = true;

export const getStaticPaths = (() => DIORAMA_LAYERS.map((l) => ({ params: { layer: l.id }, props: { svg: l.svg } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => new Response(props.svg as string, { headers: { 'Content-Type': 'image/svg+xml' } });
