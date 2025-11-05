'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ProjectCard({ project }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-white rounded-2xl shadow-md"
    >
      <Link href={`/projects/${project.id}`}>
        <h3 className="text-xl font-bold text-slate-800">{project.name}</h3>
        <p className="mt-2 text-gray-500">{project.description}</p>
        <div className="mt-4">
          <span
            className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${
              project.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'
            }`}
          >
            {project.status}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
