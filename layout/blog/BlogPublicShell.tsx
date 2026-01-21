"use client";

import React from "react";

import BlogProvider from "./BlogUiProvider";
import BlogLayout from "./blogLayout";

import type { SessionUserProp } from "@/types/Users";
import { Category } from "@/types/Category";

export default function BlogPublicShell({ user, categories, children }: { user: SessionUserProp; isLoggedIn: boolean; categories: Category[]; children: React.ReactNode }) {
  return (
    <BlogProvider>
      <BlogLayout isLoggedIn={true} user={user} categories={categories}>
        {children}
      </BlogLayout>
    </BlogProvider>
  );
}
