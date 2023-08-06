import { describe } from "node:test";

export async function getClassroomAnnouncements(all_courses: GoogleAppsScript.Classroom.Schema.Course[]): any | undefined {
    let last_updated_date_str: string = PropertiesService.getDocumentProperties().getProperty("last_updated_date")!;
    const last_updated_date: Date = new Date(last_updated_date_str!);

    let result: string[][] = [];
    // course について loop
    all_courses.forEach(function(course: GoogleAppsScript.Classroom.Schema.Course) {

        const course_name: string = course.name!;
        const response: GoogleAppsScript.Classroom.Schema.ListAnnouncementsResponse | undefined = Classroom.Courses?.Announcements?.list(course.id!);

        if (response === undefined) return;

        // Announcement について loop
        const all_announcements = response.announcements;

        if (all_announcements == undefined) return;

        all_announcements.forEach(function(announcement) {
            if (announcement == undefined) return;

            const description: string = announcement.text!;
            const url: string = announcement.alternateLink!;
            const updated_date_str: string = announcement.updateTime!;

            const updated_date: Date = new Date(updated_date_str!);

            if (last_updated_date >= updated_date) return;

            result.push([course_name, description, url, updated_date_str]);
        });
    });

    PropertiesService.getDocumentProperties().setProperty("last_updated_date", last_updated_date_str);
}

export async function getClassroomAttachments(all_courses: GoogleAppsScript.Classroom.Schema.Course[], last_updated_date_str: string): any | undefined {
    let result: string[][] = [];
    const last_updated_date: Date = new Date(last_updated_date_str!);

    // course について loop
    all_courses.forEach(function(course: GoogleAppsScript.Classroom.Schema.Course) {
        const course_name: string = course.name!;
        const response: GoogleAppsScript.Classroom.Schema.ListCourseWorkMaterialResponse | undefined = Classroom.Courses?.CourseWorkMaterials?.list(course.id!);

        if (response === undefined) return;

        // coursework について loop
        const every_coursework = response.courseWorkMaterial;
        if (every_coursework == undefined) return;

        every_coursework.forEach(function(coursework) {
            if (coursework == undefined) return;
            const updated_date_str: string = coursework.updateTime!;
            const updated_date: Date = new Date(updated_date_str!);
            const last_updated_date: Date = new Date(last_updated_date_str!);

            if (last_updated_date >= updated_date) return;

            const title: string = coursework.title!;
            const url: string = coursework.alternateLink!;
            const files_url: any[] = [];

            // 課題についている pdf とかの url と title を取得
            coursework.materials?.forEach(function(material) {
                const material_title: string = material.driveFile?.driveFile?.title!;
                const alt_url: string = material.driveFile?.driveFile?.alternateLink!;

                const json: Embed = {
                    name: material_title,
                    value: alt_url,
                    inline: false
                };

                files_url.push(json);
            })

            const json: Embeds = {
                title: title,
                url: url,
                fields: files_url
            }

            postToDiscord(json);
        });
    });

    PropertiesService.getDocumentProperties().setProperty("last_updated_date", last_updated_date_str);
}


export function postToDiscord(json: Embeds) {
    // PropertiesService.getDocumentProperties().setProperty("discord", "insert_your_webhook_url");

    const discord_url: string | null = PropertiesService.getDocumentProperties().getProperty("discord");

    const message: DiscordMessage = {
        "embeds": json
    };

    const param: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions =
    {
        "method": "post",
        "headers": { 'Content-type': "application/json" },
        "payload": JSON.stringify(message)
    }

    UrlFetchApp.fetch(discord_url!, param);
}
