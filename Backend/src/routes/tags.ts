import express from "express";
import { isLoggedIn, isTeacher } from "./auth";
import { validate, VALIDATION_LANGUAGE } from "shared/utils/validator";
import { Tag } from "shared/dto/tag";
import { getRepository } from "../database/datasource";
import { TeacherRequest } from "../model/TeacherRequest";
import { TblTags } from "../database/entities/TblTags";
import { ListElement } from "shared/dto/ListElement";
import { ENDPOINTS } from "shared/constants/endpoints";
const router = express.Router();

router.get(
  ENDPOINTS.TAGS,
  isLoggedIn,
  isTeacher,
  async function (req: TeacherRequest, res) {
    let tagsRepo = await getRepository<TblTags>(TblTags);
    let tags = await tagsRepo.find({
      where: {
        idCorso: req.courseId,
      },
    });

    let response = tags.map<Tag>(
      (element) =>
        ({
          id: element.id,
          tag: element.tag,
        } as Tag)
    );

    res.send(response);
  }
);

router.post(
  ENDPOINTS.SAVE_TAG,
  isLoggedIn,
  isTeacher,
  async function (req: TeacherRequest, res) {
    let tag = new Tag(req.body);
    let errors = await validate(tag, VALIDATION_LANGUAGE.IT);
    if (errors.length !== 0) {
      res.sendStatus(400);
      return;
    }

    let tagsRepo = await getRepository<TblTags>(TblTags);
    let tagData: TblTags;
    if (!!tag.id && tag.id > 0) {
      tagData = await tagsRepo.findOne({
        where: {
          id: tag.id,
        },
      });
    } else {
      tagData = new TblTags();
    }

    tagData.tag = tag.tag;
    tagData.idCorso = req.courseId;
    await tagsRepo.save(tagData);
    res.send(tagData);
  }
);

router.delete(
  ENDPOINTS.DELETE_TAG,
  isLoggedIn,
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

router.get(
  ENDPOINTS.TAGS_LIST,
  isLoggedIn,
  isTeacher,
  async function (req: TeacherRequest, res) {
    try {
      let tagsRepo = await getRepository<TblTags>(TblTags);
      let results = await tagsRepo.find();

      let response = results.map(
        (item) =>
          ({ id: item.id, data: item.tag } as ListElement<number, string>)
      );
      res.send(response);
    } catch {
      res.send([]);
    }
  }
);

export { router as tagsRouter };
