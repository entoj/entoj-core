<%@ page contentType="text/html; charset=UTF-8" session="false" %>
<%@ include file="../../../../../WEB-INF/includes/taglibs.jinc" %>
<cm:include self="${ model.text }" />
<cm:link var="link" target="${ model.link }" />
<c:set var="text"><cm:include self="${ model.text }" /></c:set>
<jsp:useBean id="globalMediaQueries" class="java.util.TreeMap" /><c:set target="${ globalMediaQueries }" property="applicationAndAbove" value="(min-width: 1280px)" /><c:set target="${ globalMediaQueries }" property="application" value="(min-width: 1280px)" /><c:set target="${ globalMediaQueries }" property="tabletAndBelow" value="(max-width: 1024px)" /><c:set target="${ globalMediaQueries }" property="tabletAndAbove" value="(min-width: 1024px)" /><c:set target="${ globalMediaQueries }" property="tablet" value="(min-width: 1024px) and (max-width: 1024px)" /><c:set target="${ globalMediaQueries }" property="mobileAndBelow" value="(max-width: 375px)" /><c:set target="${ globalMediaQueries }" property="mobile" value="(max-width: 375px)" /><c:set var="${ mediaQuery }" value="${ globalMediaQueries[breakpoint] }" />
<c:set var="${ src }" value="${ tk:responsiveImageLink(self, pageContext, image.aspect, image.width) }" />
<c:set var="${ src }" value="${ tk:responsiveImageLink(self, pageContext, image.aspect, image.width, image.height) }" />
