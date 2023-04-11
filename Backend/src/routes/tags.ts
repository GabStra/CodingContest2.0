import express from "express";
import { isLoggedIn, isTeacher } from "./auth";
import { validate, VALIDATION_LANGUAGE } from "shared/dist/helper/validator";
import { TagDTO } from "shared/dist/dto/tagDTO";
import { getRepository } from "../database/datasource";
import { TeacherRequest } from "../model/TeacherRequest";
import { TblTags } from "../database/entities/TblTags";
const router = express.Router();

router.get("/tags", isTeacher, async function (req: TeacherRequest, res) {
  let tagsRepo = await getRepository<TblTags>(TblTags);
  let tags = await tagsRepo.find({
    where: {
      idCorso: req.courseId,
    },
  });

  let response = tags.map<TagDTO>((element) => ({
    id: element.id,
    tag: element.tag,
  }));

  res.send(response);
});

router.post("/save-tag", isTeacher, async function (req: TeacherRequest, res) {
  let tagDTO = new TagDTO(req.body);
  let errors = await validate(tagDTO, VALIDATION_LANGUAGE.IT);
  if (errors.length !== 0) {
    res.sendStatus(400);
    return;
  }

  let tagsRepo = await getRepository<TblTags>(TblTags);
  let tagData: TblTags;
  if (!!tagDTO.id && tagDTO.id > 0) {
    tagData = await tagsRepo.findOne({
      where: {
        id: tagDTO.id,
      },
    });
  } else {
    tagData = new TblTags();
  }

  tagData.tag = tagDTO.tag;
  tagData.idCorso = req.courseId;
  await tagsRepo.save(tagData);
  res.send(tagData);
});

router.delete(
  "/delete-tag",
  isTeacher,
  async function (req: TeacherRequest, res) {
    let tagsRepo = await getRepository<TblTags>(TblTags);
    let tagId = Number(req.query.id);
    let tagData = await await tagsRepo.findOne({
      where: {
        id: tagId,
      },
    });

    if (!tagData) {
      res.sendStatus(404);
      return;
    }
    await tagsRepo.delete(tagId);
    res.sendStatus(200);
  }
);

export { router as tagsRouter };
