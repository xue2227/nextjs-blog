import fs from 'fs';
import path from "path";
import matter from "gray-matter";
import {remark} from 'remark';
import html from 'remark-html';


const postsDirectory = path.join(process.cwd(), "posts");

export function getSortedPostsData() {
  //拿取/posts資料夾中的所有檔案名稱
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileNames) => {
    //移除檔名中的.md並將其作為id
    const id = fileNames.replace(/\.md/, "");

    //將markdown的內容轉換為字串
    const fullPath = path.join(postsDirectory, fileNames);
    const fileContents = fs.readFileSync(fullPath, "utf-8");

    // 使用 gray-matter 解析 metadata 區塊
    const matterResult = matter(fileContents);

    //將資料與id結合
    return {
      id,
      ...matterResult.data,
    };
  });
  //依照日期排序
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);
  //must return obj array like
  // [
  //   {
  //     params: {
  //       id: "post1",
  //     }
  //   },
  //   {
  //     params: {
  //       id: "post2",
  //     }
  //   }
  // ];

  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ''),
      }
    }
  })
}


export async function getPostData(id) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  //Use hray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  //Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Combine the data with the id
  return {
    id,
    contentHtml,
    ...matterResult.data,
  };
}

